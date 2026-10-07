"""Change DateTime columns to timezone-aware TIMESTAMPTZ

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-07

Fixes asyncpg DataError: can't subtract offset-naive and offset-aware datetimes.
All DateTime columns must be TIMESTAMPTZ to accept datetime.now(timezone.utc).
"""
from alembic import op
import sqlalchemy as sa

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('users', 'created_at',
                    type_=sa.DateTime(timezone=True),
                    existing_type=sa.DateTime(timezone=False),
                    existing_nullable=False)

    op.alter_column('rides', 'requested_at',
                    type_=sa.DateTime(timezone=True),
                    existing_type=sa.DateTime(timezone=False),
                    existing_nullable=False)
    op.alter_column('rides', 'started_at',
                    type_=sa.DateTime(timezone=True),
                    existing_type=sa.DateTime(timezone=False),
                    existing_nullable=True)
    op.alter_column('rides', 'completed_at',
                    type_=sa.DateTime(timezone=True),
                    existing_type=sa.DateTime(timezone=False),
                    existing_nullable=True)

    op.alter_column('ride_status_events', 'timestamp',
                    type_=sa.DateTime(timezone=True),
                    existing_type=sa.DateTime(timezone=False),
                    existing_nullable=False)

    op.alter_column('wallet_transactions', 'created_at',
                    type_=sa.DateTime(timezone=True),
                    existing_type=sa.DateTime(timezone=False),
                    existing_nullable=False)

    op.alter_column('payments', 'created_at',
                    type_=sa.DateTime(timezone=True),
                    existing_type=sa.DateTime(timezone=False),
                    existing_nullable=False)

    op.alter_column('notifications', 'created_at',
                    type_=sa.DateTime(timezone=True),
                    existing_type=sa.DateTime(timezone=False),
                    existing_nullable=False)

    op.alter_column('support_tickets', 'created_at',
                    type_=sa.DateTime(timezone=True),
                    existing_type=sa.DateTime(timezone=False),
                    existing_nullable=False)

    op.alter_column('blog_posts', 'published_at',
                    type_=sa.DateTime(timezone=True),
                    existing_type=sa.DateTime(timezone=False),
                    existing_nullable=False)


def downgrade() -> None:
    for table, col in [
        ('users', 'created_at'),
        ('rides', 'requested_at'),
        ('rides', 'started_at'),
        ('rides', 'completed_at'),
        ('ride_status_events', 'timestamp'),
        ('wallet_transactions', 'created_at'),
        ('payments', 'created_at'),
        ('notifications', 'created_at'),
        ('support_tickets', 'created_at'),
        ('blog_posts', 'published_at'),
    ]:
        op.alter_column(table, col,
                        type_=sa.DateTime(timezone=False),
                        existing_type=sa.DateTime(timezone=True))
