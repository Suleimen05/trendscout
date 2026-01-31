import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CreditCard,
  Check,
  Crown,
  Loader2,
  ExternalLink,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SubscriptionInfo {
  plan: string;
  status: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
}

const planDetails: Record<string, { name: string; price: { monthly: number; yearly: number }; color: string }> = {
  free: { name: 'Free', price: { monthly: 0, yearly: 0 }, color: 'bg-gray-500' },
  creator: { name: 'Creator', price: { monthly: 19, yearly: 144 }, color: 'bg-blue-500' },
  pro: { name: 'Pro', price: { monthly: 49, yearly: 348 }, color: 'bg-purple-500' },
  agency: { name: 'Agency', price: { monthly: 149, yearly: 1068 }, color: 'bg-orange-500' },
};

export function BillingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, getAccessToken, refreshUser } = useAuth();

  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // Check for success/cancel from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast.success('Subscription activated successfully!');
      // Refresh user data to get updated subscription
      if (refreshUser) {
        refreshUser();
      }
    } else if (canceled === 'true') {
      toast.info('Checkout was canceled');
    }
  }, [searchParams, refreshUser]);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = await getAccessToken();
        const response = await fetch(`${API_URL}/stripe/subscription`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        // Fallback to user data
        setSubscription({
          plan: user?.subscription || 'free',
          status: 'active',
          cancel_at_period_end: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [getAccessToken, user]);

  const handleManageBilling = async () => {
    setIsPortalLoading(true);

    try {
      const token = await getAccessToken();
      const response = await fetch(`${API_URL}/stripe/create-portal-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to open billing portal');
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.portal_url;

    } catch (error: any) {
      console.error('Portal error:', error);
      toast.error(error.message || 'Failed to open billing portal');
    } finally {
      setIsPortalLoading(false);
    }
  };

  const currentPlan = subscription?.plan || user?.subscription || 'free';
  const planInfo = planDetails[currentPlan] || planDetails.free;

  const formatDate = (timestamp?: string | number) => {
    if (!timestamp) return '';
    const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-7 w-7" />
          Billing
        </h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${planInfo.color}`}>
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{planInfo.name} Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {currentPlan === 'free'
                        ? 'Free forever'
                        : `$${planInfo.price.monthly}/month`}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    subscription?.status === 'active'
                      ? 'text-green-600 border-green-300'
                      : 'text-yellow-600 border-yellow-300'
                  }
                >
                  {subscription?.cancel_at_period_end
                    ? 'Canceling'
                    : subscription?.status === 'active'
                    ? 'Active'
                    : subscription?.status || 'Active'}
                </Badge>
              </div>

              {/* Billing Period */}
              {subscription?.current_period_end && currentPlan !== 'free' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {subscription.cancel_at_period_end
                      ? `Access until ${formatDate(subscription.current_period_end)}`
                      : `Renews on ${formatDate(subscription.current_period_end)}`}
                  </span>
                </div>
              )}

              {/* Cancellation Notice */}
              {subscription?.cancel_at_period_end && (
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-600">
                      Subscription Canceled
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your subscription will end on{' '}
                      {formatDate(subscription.current_period_end)}. You can
                      resubscribe anytime.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentPlan === 'free' ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upgrade to unlock premium features like advanced analytics,
                    unlimited AI scripts, and more.
                  </p>
                  <Button onClick={() => navigate('/dashboard/pricing')}>
                    <Crown className="h-4 w-4 mr-2" />
                    View Plans & Upgrade
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Manage your subscription, update payment method, view invoices,
                    or cancel your plan.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleManageBilling}
                      disabled={isPortalLoading}
                    >
                      {isPortalLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4 mr-2" />
                      )}
                      Manage Billing
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/dashboard/pricing')}
                    >
                      Change Plan
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentPlan === 'free' && (
                  <>
                    <FeatureItem text="Connect up to 3 accounts" />
                    <FeatureItem text="Basic analytics dashboard" />
                    <FeatureItem text="AI-powered insights" />
                    <FeatureItem text="Video library access" />
                  </>
                )}
                {currentPlan === 'creator' && (
                  <>
                    <FeatureItem text="Everything in Free" />
                    <FeatureItem text="Unlimited trend views" />
                    <FeatureItem text="50 AI scripts per month" />
                    <FeatureItem text="7-day historical data" />
                    <FeatureItem text="Export to CSV" />
                  </>
                )}
                {currentPlan === 'pro' && (
                  <>
                    <FeatureItem text="Everything in Creator" />
                    <FeatureItem text="Deep Analyze (6-layer UTS)" />
                    <FeatureItem text="Unlimited AI scripts" />
                    <FeatureItem text="30-day historical data" />
                    <FeatureItem text="Visual clustering (AI)" />
                    <FeatureItem text="Priority support" />
                  </>
                )}
                {currentPlan === 'agency' && (
                  <>
                    <FeatureItem text="Everything in Pro" />
                    <FeatureItem text="5 team members" />
                    <FeatureItem text="90-day historical data" />
                    <FeatureItem text="API access (10K/mo)" />
                    <FeatureItem text="Dedicated support" />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Check className="h-4 w-4 text-green-500" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

export { BillingPage as Billing };
