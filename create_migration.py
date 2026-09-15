#!/usr/bin/env python3
import os
import sys
from alembic.config import Config
from alembic import command

# Use the internal Docker network address
os.environ['DATABASE_URL'] = 'postgresql://postgres:[REDACTED]@churn-db:5432/retail_churn'

cfg = Config("alembic.ini")
# Override sqlalchemy.url for this run
cfg.set_main_option("sqlalchemy.url", os.environ['DATABASE_URL'])

try:
    command.revision(cfg, autogenerate=True, message="create users and predictions tables")
    print("Migration created successfully!")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
