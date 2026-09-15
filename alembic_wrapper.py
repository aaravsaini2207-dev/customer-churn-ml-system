#!/usr/bin/env python3
"""
Wrapper to run alembic commands inside the database container.
Usage: python alembic_wrapper.py revision --autogenerate -m "message"
       python alembic_wrapper.py upgrade head
       python alembic_wrapper.py downgrade -1
"""
import subprocess
import sys
import os

def run_alembic_in_container(*args):
    """Run alembic command inside churn-db container."""
    cmd = [
        "docker", "run", "--rm",
        "--network", "project_default",
        "-v", f"{os.getcwd()}:/workspace",
        "-w", "/workspace",
        "python:3.11",
        "bash", "-c",
        "pip install alembic sqlalchemy psycopg2-binary -q && "
        "export DATABASE_URL='postgresql://postgres:[REDACTED]@churn-db:5432/retail_churn' && "
        f"alembic {' '.join(args)}"
    ]
    
    result = subprocess.run(cmd, capture_output=False)
    sys.exit(result.returncode)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python alembic_wrapper.py <alembic-command> [args]")
        print("Example: python alembic_wrapper.py upgrade head")
        sys.exit(1)
    
    run_alembic_in_container(*sys.argv[1:])
