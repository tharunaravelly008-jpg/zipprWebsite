"""Initial schema creation for Zippr tables.

Revision ID: 0001
Revises: 
Create Date: 2026-07-20 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('role', sa.Enum('user', 'driver', 'admin', name='roleenum'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_phone'), 'users', ['phone'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # 2. driver_profiles
    op.create_table(
        'driver_profiles',
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('vehicle_type', sa.String(), nullable=False),
        sa.Column('vehicle_number', sa.String(), nullable=False),
        sa.Column('license_number', sa.String(), nullable=False),
        sa.Column('is_online', sa.Boolean(), nullable=False, default=False),
        sa.Column('current_lat', sa.Float(), nullable=True),
        sa.Column('current_lng', sa.Float(), nullable=True),
        sa.Column('rating', sa.Float(), nullable=False, default=5.0),
        sa.Column('is_verified', sa.Boolean(), nullable=False, default=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id')
    )

    # 3. wallets
    op.create_table(
        'wallets',
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('balance', sa.Float(), nullable=False, default=0.0),
        sa.Column('currency', sa.String(), nullable=False, default='INR'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id')
    )

    # 4. rides
    op.create_table(
        'rides',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('rider_id', sa.String(), nullable=False),
        sa.Column('driver_id', sa.String(), nullable=True),
        sa.Column('pickup_lat', sa.Float(), nullable=False),
        sa.Column('pickup_lng', sa.Float(), nullable=False),
        sa.Column('drop_lat', sa.Float(), nullable=False),
        sa.Column('drop_lng', sa.Float(), nullable=False),
        sa.Column('vehicle_type', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('requested', 'accepted', 'ongoing', 'completed', 'cancelled', name='ridestatusenum'), nullable=False),
        sa.Column('fare_estimate', sa.Float(), nullable=False),
        sa.Column('fare_final', sa.Float(), nullable=True),
        sa.Column('distance_km', sa.Float(), nullable=False),
        sa.Column('requested_at', sa.DateTime(), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['driver_id'], ['driver_profiles.user_id']),
        sa.ForeignKeyConstraint(['rider_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_rides_id'), 'rides', ['id'], unique=False)
    op.create_index(op.f('ix_rides_rider_id'), 'rides', ['rider_id'], unique=False)
    op.create_index(op.f('ix_rides_driver_id'), 'rides', ['driver_id'], unique=False)
    op.create_index(op.f('ix_rides_status'), 'rides', ['status'], unique=False)

    # 5. ride_status_events
    op.create_table(
        'ride_status_events',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('ride_id', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('requested', 'accepted', 'ongoing', 'completed', 'cancelled', name='ridestatusenum'), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['ride_id'], ['rides.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 6. payments
    op.create_table(
        'payments',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('ride_id', sa.String(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('method', sa.Enum('wallet', 'card', 'upi', 'cash', name='paymentmethodenum'), nullable=False),
        sa.Column('status', sa.Enum('pending', 'success', 'failed', 'refunded', name='paymentstatusenum'), nullable=False),
        sa.Column('transaction_ref', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['ride_id'], ['rides.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_payments_id'), 'payments', ['id'], unique=False)

    # 7. wallet_transactions
    op.create_table(
        'wallet_transactions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('wallet_id', sa.String(), nullable=False),
        sa.Column('type', sa.Enum('credit', 'debit', name='transactiontypeenum'), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('reason', sa.String(), nullable=False),
        sa.Column('ride_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['ride_id'], ['rides.id']),
        sa.ForeignKeyConstraint(['wallet_id'], ['wallets.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 8. notifications
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('body', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)

    # 9. ratings
    op.create_table(
        'ratings',
        sa.Column('ride_id', sa.String(), nullable=False),
        sa.Column('rated_by', sa.String(), nullable=False),
        sa.Column('rated_user', sa.String(), nullable=False),
        sa.Column('stars', sa.Integer(), nullable=False),
        sa.Column('comment', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['rated_by'], ['users.id']),
        sa.ForeignKeyConstraint(['rated_user'], ['users.id']),
        sa.ForeignKeyConstraint(['ride_id'], ['rides.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('ride_id')
    )

    # 10. blog_posts
    op.create_table(
        'blog_posts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('cover_image', sa.String(), nullable=True),
        sa.Column('content', sa.String(), nullable=False),
        sa.Column('author', sa.String(), nullable=False),
        sa.Column('published_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_blog_posts_slug'), 'blog_posts', ['slug'], unique=True)

    # 11. support_tickets
    op.create_table(
        'support_tickets',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('subject', sa.String(), nullable=False),
        sa.Column('message', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, default='open'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_support_tickets_user_id'), 'support_tickets', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_support_tickets_user_id'), table_name='support_tickets')
    op.drop_table('support_tickets')
    op.drop_index(op.f('ix_blog_posts_slug'), table_name='blog_posts')
    op.drop_table('blog_posts')
    op.drop_table('ratings')
    op.drop_index(op.f('ix_notifications_user_id'), table_name='notifications')
    op.drop_table('notifications')
    op.drop_table('wallet_transactions')
    op.drop_index(op.f('ix_payments_id'), table_name='payments')
    op.drop_table('payments')
    op.drop_table('ride_status_events')
    op.drop_index(op.f('ix_rides_status'), table_name='rides')
    op.drop_index(op.f('ix_rides_driver_id'), table_name='rides')
    op.drop_index(op.f('ix_rides_rider_id'), table_name='rides')
    op.drop_index(op.f('ix_rides_id'), table_name='rides')
    op.drop_table('rides')
    op.drop_table('wallets')
    op.drop_table('driver_profiles')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_phone'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    
    # Drop enum types as well in database engine
    sa.Enum(name='roleenum').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='ridestatusenum').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='paymentmethodenum').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='paymentstatusenum').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='transactiontypeenum').drop(op.get_bind(), checkfirst=True)
