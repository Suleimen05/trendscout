"""add_feedback_table

Revision ID: dcaeba9948be
Revises: fb2d43a15f44
Create Date: 2026-02-02 23:13:02.135810

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dcaeba9948be'
down_revision: Union[str, None] = 'fb2d43a15f44'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create feedback table only if it doesn't exist (production may already have it)
    op.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            feedback_type VARCHAR(20) NOT NULL,
            message TEXT NOT NULL,
            rating INTEGER,
            user_email VARCHAR(255),
            is_read BOOLEAN NOT NULL DEFAULT false,
            admin_notes TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_feedback_id ON feedback (id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_feedback_user_id ON feedback (user_id)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_feedback_user_id")
    op.execute("DROP INDEX IF EXISTS ix_feedback_id")
    op.execute("DROP TABLE IF EXISTS feedback")
