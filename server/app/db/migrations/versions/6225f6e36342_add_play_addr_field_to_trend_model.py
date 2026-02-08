"""Add play_addr field to Trend model

Revision ID: 6225f6e36342
Revises: e8f7a9c2b1d3
Create Date: 2026-02-07 01:36:45.829576

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6225f6e36342'
down_revision: Union[str, None] = 'e8f7a9c2b1d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE trends ADD COLUMN IF NOT EXISTS play_addr VARCHAR(500)")


def downgrade() -> None:
    op.execute("ALTER TABLE trends DROP COLUMN IF EXISTS play_addr")
