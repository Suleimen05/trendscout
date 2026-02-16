"""add is_pinned field to chat_sessions

Revision ID: add_chat_pinned
Revises: add_wf_chat
Create Date: 2026-02-17 02:00:00.000000

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'add_chat_pinned'
down_revision = 'add_wf_chat'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE")


def downgrade():
    op.execute("ALTER TABLE chat_sessions DROP COLUMN IF EXISTS is_pinned")
