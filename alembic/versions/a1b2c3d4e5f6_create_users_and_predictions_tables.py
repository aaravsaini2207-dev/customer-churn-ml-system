"""create users and predictions tables

Revision ID: a1b2c3d4e5f6
Revises: b9c2c9e40c8d
Create Date: 2026-09-15 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'b9c2c9e40c8d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    
    # Create predictions table
    op.create_table(
        'predictions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('recency', sa.Integer(), nullable=True),
        sa.Column('frequency', sa.Integer(), nullable=True),
        sa.Column('monetary', sa.Float(), nullable=True),
        sa.Column('average_order_value', sa.Float(), nullable=True),
        sa.Column('unique_products', sa.Integer(), nullable=True),
        sa.Column('customer_lifetime_days', sa.Integer(), nullable=True),
        sa.Column('churn_probability', sa.Float(), nullable=True),
        sa.Column('prediction', sa.Integer(), nullable=True),
        sa.Column('prediction_label', sa.String(), nullable=True),
        sa.Column('risk', sa.String(), nullable=True),
        sa.Column('predicted_90_day_spend', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_predictions_id'), 'predictions', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop predictions table
    op.drop_index(op.f('ix_predictions_id'), table_name='predictions')
    op.drop_table('predictions')
    
    # Drop users table
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
