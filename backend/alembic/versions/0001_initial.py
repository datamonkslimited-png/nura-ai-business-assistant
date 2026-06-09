"""initial

Revision ID: 0001
Revises:
Create Date: 2026-06-08

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass  # Run: alembic revision --autogenerate -m "initial" to generate full migration


def downgrade() -> None:
    pass
