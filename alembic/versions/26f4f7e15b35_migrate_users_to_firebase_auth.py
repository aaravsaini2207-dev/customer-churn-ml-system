from alembic import op
import sqlalchemy as sa


revision = "firebase_auth_migration"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade():
    # Add Firebase UID for users
    op.add_column(
        "users",
        sa.Column(
            "firebase_uid",
            sa.String(),
            nullable=True
        )
    )

    # Firebase UID must be unique
    op.create_unique_constraint(
        "uq_users_firebase_uid",
        "users",
        ["firebase_uid"]
    )

    # Remove old password authentication
    op.drop_column("users", "password")


def downgrade():
    # Restore password column
    op.add_column(
        "users",
        sa.Column(
            "password",
            sa.String(),
            nullable=True
        )
    )

    # Remove Firebase UID unique constraint
    op.drop_constraint(
        "uq_users_firebase_uid",
        "users",
        type_="unique"
    )

    # Remove Firebase UID
    op.drop_column("users", "firebase_uid")