#!/usr/bin/env python3
import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DATABASE_URL loaded: {DATABASE_URL}")

# Parse components
from urllib.parse import urlparse
parsed = urlparse(DATABASE_URL)
print(f"Host: {parsed.hostname}")
print(f"Port: {parsed.port}")
print(f"User: {parsed.username}")
print(f"Password length: {len(parsed.password)}")
print(f"Database: {parsed.path.lstrip('/')}")

try:
    print("\nAttempting connection...")
    conn = psycopg2.connect(DATABASE_URL)
    print("SUCCESS: Connected!")
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    result = cursor.fetchone()
    print(f"Query result: {result[0][:50]}...")
    cursor.close()
    conn.close()
except psycopg2.OperationalError as e:
    print(f"FAILED: {e}")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
