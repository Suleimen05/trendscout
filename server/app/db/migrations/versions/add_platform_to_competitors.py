"""add platform field to competitors

Revision ID: add_platform_field
Revises: 6225f6e36342
Create Date: 2026-02-07 19:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_platform_field'
down_revision = '6225f6e36342'
branch_labels = None
depends_on = None


def upgrade():
    # Add platform column with default 'tiktok' for existing records (IF NOT EXISTS)
    op.execute("ALTER TABLE competitors ADD COLUMN IF NOT EXISTS platform VARCHAR(20) NOT NULL DEFAULT 'tiktok'")
    # Remove server_default after adding (best practice)
    op.execute("ALTER TABLE competitors ALTER COLUMN platform DROP DEFAULT")


def downgrade():
    op.execute("ALTER TABLE competitors DROP COLUMN IF EXISTS platform")
