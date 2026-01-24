"""
FastAPI dependencies for authentication and authorization.
Provides reusable dependencies for protecting routes.
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import decode_token
from ..db.models import User

# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.

    Args:
        credentials: HTTP Bearer token from Authorization header
        db: Database session

    Returns:
        User: The authenticated user object

    Raises:
        HTTPException: 401 if token is invalid or user not found
    """
    # Extract token from credentials
    token = credentials.credentials

    # Decode and validate token
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract user ID from token
    user_id: Optional[int] = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to get current active user.
    Additional layer for future role-based checks.

    Args:
        current_user: Current user from get_current_user dependency

    Returns:
        User: The authenticated active user

    Raises:
        HTTPException: 403 if user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


# Optional: Dependency for admin users (for future use)
async def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to verify current user has admin privileges.
    Placeholder for future role-based access control.

    Args:
        current_user: Current user from get_current_user dependency

    Returns:
        User: The authenticated admin user

    Raises:
        HTTPException: 403 if user is not an admin
    """
    # TODO: Add admin role check when implementing RBAC
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
