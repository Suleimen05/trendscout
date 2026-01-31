"""
Stripe Payment Routes
=====================
Handles subscription checkout, webhooks, and billing portal.
"""

from fastapi import APIRouter, HTTPException, Depends, Request, Header
from pydantic import BaseModel
from typing import Optional
import stripe
import os
import logging

from ...core.database import get_db
from ...db.models import User
from ..routes.auth import get_current_user
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Price IDs from Stripe Dashboard (set in .env)
PRICE_IDS = {
    "creator_monthly": os.getenv("STRIPE_PRICE_CREATOR_MONTHLY"),
    "creator_yearly": os.getenv("STRIPE_PRICE_CREATOR_YEARLY"),
    "pro_monthly": os.getenv("STRIPE_PRICE_PRO_MONTHLY"),
    "pro_yearly": os.getenv("STRIPE_PRICE_PRO_YEARLY"),
    "agency_monthly": os.getenv("STRIPE_PRICE_AGENCY_MONTHLY"),
    "agency_yearly": os.getenv("STRIPE_PRICE_AGENCY_YEARLY"),
}


# =============================================================================
# SCHEMAS
# =============================================================================

class CheckoutRequest(BaseModel):
    plan: str  # creator, pro, agency
    billing_cycle: str = "monthly"  # monthly, yearly


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class PortalResponse(BaseModel):
    portal_url: str


class SubscriptionStatus(BaseModel):
    plan: str
    status: str
    current_period_end: Optional[str] = None
    cancel_at_period_end: bool = False


# =============================================================================
# CHECKOUT SESSION
# =============================================================================

@router.post("/create-checkout-session", response_model=CheckoutResponse)
async def create_checkout_session(
    request: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Stripe Checkout session for subscription.

    Redirects user to Stripe's hosted checkout page.
    """
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    # Get the correct price ID
    price_key = f"{request.plan}_{request.billing_cycle}"
    price_id = PRICE_IDS.get(price_key)

    if not price_id:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid plan or billing cycle: {price_key}"
        )

    try:
        # Check if user already has a Stripe customer ID
        customer_id = current_user.stripe_customer_id

        if not customer_id:
            # Create a new customer in Stripe
            customer = stripe.Customer.create(
                email=current_user.email,
                name=current_user.name,
                metadata={"user_id": str(current_user.id)}
            )
            customer_id = customer.id

            # Save customer ID to user
            current_user.stripe_customer_id = customer_id
            db.commit()

        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=customer_id,
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=f"{FRONTEND_URL}/dashboard/billing?success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/dashboard/pricing?canceled=true",
            metadata={
                "user_id": str(current_user.id),
                "plan": request.plan,
                "billing_cycle": request.billing_cycle
            },
            subscription_data={
                "metadata": {
                    "user_id": str(current_user.id),
                    "plan": request.plan
                }
            },
            allow_promotion_codes=True,
        )

        logger.info(f"Created checkout session {session.id} for user {current_user.id}")

        return CheckoutResponse(
            checkout_url=session.url,
            session_id=session.id
        )

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# =============================================================================
# BILLING PORTAL
# =============================================================================

@router.post("/create-portal-session", response_model=PortalResponse)
async def create_portal_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Stripe Customer Portal session.

    Allows users to manage their subscription, update payment method,
    view invoices, and cancel.
    """
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    if not current_user.stripe_customer_id:
        raise HTTPException(
            status_code=400,
            detail="No active subscription found"
        )

    try:
        session = stripe.billing_portal.Session.create(
            customer=current_user.stripe_customer_id,
            return_url=f"{FRONTEND_URL}/dashboard/settings"
        )

        return PortalResponse(portal_url=session.url)

    except stripe.error.StripeError as e:
        logger.error(f"Stripe portal error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# =============================================================================
# SUBSCRIPTION STATUS
# =============================================================================

@router.get("/subscription", response_model=SubscriptionStatus)
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current subscription status from Stripe.
    """
    if not current_user.stripe_customer_id:
        return SubscriptionStatus(
            plan="free",
            status="active"
        )

    try:
        # Get customer's subscriptions
        subscriptions = stripe.Subscription.list(
            customer=current_user.stripe_customer_id,
            status="active",
            limit=1
        )

        if not subscriptions.data:
            return SubscriptionStatus(
                plan="free",
                status="active"
            )

        sub = subscriptions.data[0]
        plan = sub.metadata.get("plan", "unknown")

        return SubscriptionStatus(
            plan=plan,
            status=sub.status,
            current_period_end=sub.current_period_end,
            cancel_at_period_end=sub.cancel_at_period_end
        )

    except stripe.error.StripeError as e:
        logger.error(f"Stripe subscription error: {e}")
        return SubscriptionStatus(
            plan=current_user.subscription or "free",
            status="active"
        )


# =============================================================================
# WEBHOOKS
# =============================================================================

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
    db: Session = Depends(get_db)
):
    """
    Handle Stripe webhook events.

    Events handled:
    - checkout.session.completed: User completed checkout
    - customer.subscription.updated: Subscription changed
    - customer.subscription.deleted: Subscription canceled
    - invoice.payment_failed: Payment failed
    """
    if not STRIPE_WEBHOOK_SECRET:
        logger.warning("Stripe webhook secret not configured")
        return {"status": "webhook secret not configured"}

    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.error(f"Invalid webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid webhook signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]
    data = event["data"]["object"]

    logger.info(f"Received Stripe webhook: {event_type}")

    # Handle different event types
    if event_type == "checkout.session.completed":
        await handle_checkout_completed(data, db)

    elif event_type == "customer.subscription.updated":
        await handle_subscription_updated(data, db)

    elif event_type == "customer.subscription.deleted":
        await handle_subscription_deleted(data, db)

    elif event_type == "invoice.payment_failed":
        await handle_payment_failed(data, db)

    return {"status": "success", "event": event_type}


# =============================================================================
# WEBHOOK HANDLERS
# =============================================================================

async def handle_checkout_completed(session: dict, db: Session):
    """Handle successful checkout completion."""
    user_id = session.get("metadata", {}).get("user_id")
    plan = session.get("metadata", {}).get("plan")

    if not user_id or not plan:
        logger.error("Missing user_id or plan in checkout session")
        return

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        logger.error(f"User {user_id} not found")
        return

    # Update user's subscription
    user.subscription = plan
    user.stripe_subscription_id = session.get("subscription")
    db.commit()

    logger.info(f"User {user_id} upgraded to {plan}")


async def handle_subscription_updated(subscription: dict, db: Session):
    """Handle subscription updates (plan changes, renewals)."""
    customer_id = subscription.get("customer")
    plan = subscription.get("metadata", {}).get("plan")
    status = subscription.get("status")

    user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
    if not user:
        logger.warning(f"User with customer {customer_id} not found")
        return

    if status == "active":
        user.subscription = plan or user.subscription
    elif status in ["past_due", "unpaid"]:
        # Keep subscription but mark as past due (could add a status field)
        logger.warning(f"User {user.id} subscription is {status}")

    user.stripe_subscription_id = subscription.get("id")
    db.commit()

    logger.info(f"Updated subscription for user {user.id}: {status}")


async def handle_subscription_deleted(subscription: dict, db: Session):
    """Handle subscription cancellation."""
    customer_id = subscription.get("customer")

    user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
    if not user:
        logger.warning(f"User with customer {customer_id} not found")
        return

    # Downgrade to free
    user.subscription = "free"
    user.stripe_subscription_id = None
    db.commit()

    logger.info(f"User {user.id} subscription canceled, downgraded to free")


async def handle_payment_failed(invoice: dict, db: Session):
    """Handle failed payments."""
    customer_id = invoice.get("customer")

    user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
    if not user:
        return

    # Log the failure - in production, you might want to send an email
    logger.warning(f"Payment failed for user {user.id}")
    # Could add: user.payment_failed = True, then show a banner in the UI
