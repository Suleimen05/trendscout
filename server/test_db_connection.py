#!/usr/bin/env python3
"""
Quick test script to check database connection.
"""
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("=" * 60)
print("Testing Database Connection")
print("=" * 60)
print(f"Database URL: {DATABASE_URL[:50]}...")
print()

try:
    # Try to connect
    print("Attempting to connect...")
    conn = psycopg2.connect(DATABASE_URL)
    print("✅ Connection successful!")

    # Test query
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print(f"✅ PostgreSQL version: {version[0][:80]}...")

    # List tables
    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    tables = cursor.fetchall()

    if tables:
        print(f"\n✅ Found {len(tables)} tables:")
        for table in tables:
            print(f"   - {table[0]}")
    else:
        print("\n⚠️  No tables found (database is empty)")

    cursor.close()
    conn.close()
    print("\n✅ Connection test completed successfully!")

except psycopg2.OperationalError as e:
    print(f"\n❌ Connection failed!")
    print(f"Error: {str(e)}")
    print("\nPossible issues:")
    print("1. Incorrect password in DATABASE_URL")
    print("2. Wrong host/port")
    print("3. Database user doesn't exist")
    print("4. Firewall blocking connection")
    print("\nTo fix:")
    print("1. Go to Supabase Dashboard → Project Settings → Database")
    print("2. Copy the 'Connection String' (NOT Connection Pooling)")
    print("3. Update DATABASE_URL in .env file")

except Exception as e:
    print(f"\n❌ Unexpected error: {str(e)}")

print("=" * 60)
