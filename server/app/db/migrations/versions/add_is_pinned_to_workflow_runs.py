"""add is_pinned field to workflow_runs

Revision ID: add_wfrun_pinned
Revises: add_chat_pinned
Create Date: 2026-02-17 04:00:00.000000

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'add_wfrun_pinned'
down_revision = 'add_chat_pinned'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TABLE workflow_runs ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE")


def downgrade():
    op.execute("ALTER TABLE workflow_runs DROP COLUMN IF EXISTS is_pinned")
