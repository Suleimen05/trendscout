"""add_ai_credits_tracking

Revision ID: e8f7a9c2b1d3
Revises: dcaeba9948be
Create Date: 2026-02-04 23:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e8f7a9c2b1d3'
down_revision: Union[str, None] = 'dcaeba9948be'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Add AI credits tracking fields to users and user_settings tables.

    Phase 1: Basic credits tracking for Usage page MVP
    - monthly_credits_limit: Plan-based limit (100/500/2000/10000)
    - monthly_credits_used: Credits spent this month
    - bonus_credits: Bonus credits that never expire
    - rollover_credits: Credits rolled over from previous month
    - ai_auto_mode: Toggle for automatic AI model selection
    """
    # Add new fields to users table (IF NOT EXISTS for production safety)
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_credits_limit INTEGER NOT NULL DEFAULT 100")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_credits_used INTEGER NOT NULL DEFAULT 0")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS bonus_credits INTEGER NOT NULL DEFAULT 0")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS rollover_credits INTEGER NOT NULL DEFAULT 0")

    # Add ai_auto_mode to user_settings table
    op.execute("ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS ai_auto_mode BOOLEAN NOT NULL DEFAULT true")

    # Update existing users based on their subscription tier
    # Free: 100, Creator: 500, Pro: 2000, Agency: 10000
    op.execute("""
        UPDATE users
        SET monthly_credits_limit = CASE subscription_tier::text
            WHEN 'FREE' THEN 100
            WHEN 'CREATOR' THEN 500
            WHEN 'PRO' THEN 2000
            WHEN 'AGENCY' THEN 10000
            ELSE 100
        END
        WHERE monthly_credits_limit = 100
    """)

    # Give bonus credits to Creator+ users as a welcome gift
    op.execute("""
        UPDATE users
        SET bonus_credits = CASE subscription_tier::text
            WHEN 'CREATOR' THEN 150
            WHEN 'PRO' THEN 300
            WHEN 'AGENCY' THEN 500
            ELSE 0
        END
        WHERE bonus_credits = 0
    """)


def downgrade() -> None:
    """Remove AI credits tracking fields."""
    op.execute("ALTER TABLE user_settings DROP COLUMN IF EXISTS ai_auto_mode")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS rollover_credits")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS bonus_credits")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS monthly_credits_used")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS monthly_credits_limit")
