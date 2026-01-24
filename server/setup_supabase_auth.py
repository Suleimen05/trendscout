#!/usr/bin/env python3
"""
Setup Supabase authentication using REST API.
Creates test users via Supabase Auth API.
"""
import requests
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("=" * 60)
print("Supabase Auth Setup")
print("=" * 60)
print(f"Supabase URL: {SUPABASE_URL}")
print(f"Supabase Key: {SUPABASE_KEY[:30]}...")
print()

# Test users to create
test_users = [
    {"email": "test1@trendscout.ai", "password": "Test1234", "full_name": "Alex Johnson"},
    {"email": "test2@trendscout.ai", "password": "Test1234", "full_name": "Sarah Williams"},
    {"email": "test3@trendscout.ai", "password": "Test1234", "full_name": "Michael Brown"},
    {"email": "demo@trendscout.ai", "password": "Demo1234", "full_name": "Demo User"},
    {"email": "investor@trendscout.ai", "password": "Invest1234", "full_name": "Investor Demo"},
]

headers = {
    "apikey": SUPABASE_KEY,
    "Content-Type": "application/json",
}

created = 0
failed = 0

print("Creating test users...")
print("-" * 60)

for user in test_users:
    try:
        # Sign up user via Supabase Auth
        response = requests.post(
            f"{SUPABASE_URL}/auth/v1/signup",
            headers=headers,
            json={
                "email": user["email"],
                "password": user["password"],
                "data": {
                    "full_name": user["full_name"]
                }
            },
            timeout=10
        )

        if response.status_code in [200, 201]:
            print(f"✅ Created: {user['email']}")
            created += 1
        elif response.status_code == 422 and "already registered" in response.text.lower():
            print(f"⏭️  Exists: {user['email']}")
        else:
            print(f"❌ Failed: {user['email']} - {response.status_code}: {response.text[:100]}")
            failed += 1

    except Exception as e:
        print(f"❌ Error creating {user['email']}: {str(e)[:100]}")
        failed += 1

print("-" * 60)
print(f"\n✅ Summary:")
print(f"   Created: {created}")
print(f"   Already existed: {len(test_users) - created - failed}")
print(f"   Failed: {failed}")

if created > 0 or (failed == 0):
    print(f"\n🎉 Setup complete!")
    print(f"\nTest credentials:")
    for user in test_users:
        print(f"   {user['email']} / {user['password']}")

print("=" * 60)
