"""
Pydantic schemas for authentication endpoints.
Handles request/response validation with proper typing.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator


# ============================================================================
# User Registration & Login Schemas
# ============================================================================

class UserRegister(BaseModel):
    """Schema for user registration request."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, max_length=100, description="User password (min 8 characters)")
    full_name: Optional[str] = Field(None, max_length=100, description="User's full name")

    @validator('password')
    def password_strength(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isalpha() for char in v):
            raise ValueError('Password must contain at least one letter')
        return v


class UserLogin(BaseModel):
    """Schema for user login request."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


# ============================================================================
# Token Schemas
# ============================================================================

class Token(BaseModel):
    """Schema for token response."""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")


class TokenRefresh(BaseModel):
    """Schema for token refresh request."""
    refresh_token: str = Field(..., description="JWT refresh token")


# ============================================================================
# User Response Schemas
# ============================================================================

class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True


class UserResponse(UserBase):
    """Schema for user data in responses."""
    id: int
    is_verified: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Allows ORM model conversion


class UserWithSettings(UserResponse):
    """Extended user response with settings."""
    settings: Optional['UserSettingsResponse'] = None

    class Config:
        from_attributes = True


# ============================================================================
# Settings Schemas
# ============================================================================

class UserSettingsBase(BaseModel):
    """Base settings schema."""
    dark_mode: bool = False
    language: str = "en"
    region: str = "US"
    auto_generate_scripts: bool = True
    notifications_trends: bool = True
    notifications_competitors: bool = True
    notifications_new_videos: bool = False
    notifications_weekly_report: bool = True


class UserSettingsUpdate(BaseModel):
    """Schema for updating user settings (all fields optional)."""
    dark_mode: Optional[bool] = None
    language: Optional[str] = None
    region: Optional[str] = None
    auto_generate_scripts: Optional[bool] = None
    notifications_trends: Optional[bool] = None
    notifications_competitors: Optional[bool] = None
    notifications_new_videos: Optional[bool] = None
    notifications_weekly_report: Optional[bool] = None


class UserSettingsResponse(UserSettingsBase):
    """Schema for settings response."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Authentication Response
# ============================================================================

class AuthResponse(BaseModel):
    """Complete authentication response with user data and tokens."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


# Update forward references
UserWithSettings.model_rebuild()
