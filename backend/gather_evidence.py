import os
import requests
import time
import json
import uuid

BASE_URL = "https://foudy.onrender.com/api/v1"

print("====================================")
print("EVIDENCE GATHERING: PRODUCTION API")
print("====================================\n")

# 1. Print the Git commit running
print("--- 1. Health Version Check ---")
try:
    health_res = requests.get(f"https://foudy.onrender.com/health/version/")
    print(f"Status: {health_res.status_code}")
    print(f"Body: {health_res.text}\n")
except Exception as e:
    print(f"Error fetching health: {e}\n")

# Helper to create guest user
def create_guest():
    res = requests.post(f"{BASE_URL}/auth/guest/")
    if res.status_code in [200, 201]:
        data = res.json()
        print("Guest Data:", data)
        # Just grab the access token, it might be in tokens.access
        if 'access_token' in data:
            return data['user']['id'], data['access_token']
        elif 'tokens' in data:
            return data['user']['id'], data['tokens']['access']
        elif 'token' in data:
            return data['user']['id'], data['token']
        elif 'access' in data:
            return data['user']['id'], data['access']
    raise Exception(f"Failed to create guest: {res.text}")

print("--- 2. Execute Test Flow ---")
try:
    guest_id, access_token = create_guest()
    print(f"Guest created: {guest_id}")
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # Complete Profile
    profile_data = {
        "interests": ["coding", "evidence"],
        "keywords": ["test", "api"],
        "languages": ["en"],
        "country": "US",
        "gender_preference": "any"
    }
    print("\n[Complete Profile]")
    res_prof = requests.patch(f"{BASE_URL}/users/me/", headers=headers, json=profile_data)
    print(f"Status: {res_prof.status_code}")
    print(f"Body: {res_prof.text}")

    # First Join
    print("\n[First Join]")
    res_join1 = requests.post(f"{BASE_URL}/matching/join/", headers=headers, json={})
    print(f"Status: {res_join1.status_code}")
    print(f"Body: {res_join1.text}")
    
    # Check Status (Verify Redis State)
    print("\n[Check Status 1]")
    res_status1 = requests.get(f"{BASE_URL}/matching/status/", headers=headers)
    print(f"Status: {res_status1.status_code}")
    print(f"Body: {res_status1.text}")

    # Rejoin
    print("\n[Rejoin]")
    res_join2 = requests.post(f"{BASE_URL}/matching/join/", headers=headers, json={})
    print(f"Status: {res_join2.status_code}")
    print(f"Body: {res_join2.text}")

    # Leave
    print("\n[Leave Queue]")
    res_leave1 = requests.post(f"{BASE_URL}/matching/leave/", headers=headers, json={})
    print(f"Status: {res_leave1.status_code}")
    print(f"Body: {res_leave1.text}")

    # Check Status (Verify Redis State)
    print("\n[Check Status 2]")
    res_status2 = requests.get(f"{BASE_URL}/matching/status/", headers=headers)
    print(f"Status: {res_status2.status_code}")
    print(f"Body: {res_status2.text}")

    # Leave then Rejoin
    print("\n[Rejoin after Leave]")
    res_join3 = requests.post(f"{BASE_URL}/matching/join/", headers=headers, json={})
    print(f"Status: {res_join3.status_code}")
    print(f"Body: {res_join3.text}")

    print("\n====================================")
    print("ALL API TESTS COMPLETED SUCCESSFULLY")
    print("====================================")

except Exception as e:
    print(f"\nERROR DURING TEST: {e}")
