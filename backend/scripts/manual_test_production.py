import requests
import time
import json

BASE_URL = "https://foudy.onrender.com/api/v1"

print("====================================")
print("TESTING PRODUCTION MATCHMAKING")
print("====================================")

# 1. Login as Guest 1
print("\n--- Creating Guest 1 ---")
r1 = requests.post(f"{BASE_URL}/auth/guest/")
assert r1.status_code in [200, 201], f"Guest login failed: {r1.text}"
user1_token = r1.json().get('access_token') or r1.json().get('access')
user1_id = r1.json().get('user', {}).get('id')
print(f"Guest 1 logged in. ID: {user1_id}")

headers1 = {"Authorization": f"Bearer {user1_token}"}

# Complete profile for Guest 1
print("\n--- Completing Profile for Guest 1 ---")
profile_data = {
    "display_name": "Guest 1",
    "bio": "Hello world",
    "interests": ["coding", "gaming"],
    "languages": ["en"],
    "country": "US",
    "gender_preference": "any"
}
p1 = requests.patch(f"{BASE_URL}/users/me/", headers=headers1, json=profile_data)
print("Profile update status:", p1.status_code)
if p1.status_code != 200:
    print("Failed to update profile:", p1.text)


# Set up profile for Guest 1 (might be required before matching)
# Actually, the user profile is created automatically for guests?
# Let's just try joining.

print("\n--- Test: First Join ---")
join_res1 = requests.post(f"{BASE_URL}/matching/join/", headers=headers1, json={})
print(f"First Join Status: {join_res1.status_code}")
if join_res1.status_code != 200:
    print("Response:", join_res1.text)

print("\n--- Test: Rejoin (while already in queue) ---")
time.sleep(1)
rejoin_res1 = requests.post(f"{BASE_URL}/matching/join/", headers=headers1, json={})
print(f"Rejoin Status: {rejoin_res1.status_code}")
if rejoin_res1.status_code != 200:
    print("Response:", rejoin_res1.text)
    if rejoin_res1.status_code == 500:
        print("FAIL: HTTP 500 still occurring on rejoin!")

print("\n--- Test: Leave Queue ---")
leave_res1 = requests.post(f"{BASE_URL}/matching/leave/", headers=headers1, json={})
print(f"Leave Status: {leave_res1.status_code}")

print("\n--- Test: Leave then Rejoin ---")
time.sleep(1)
rejoin2_res1 = requests.post(f"{BASE_URL}/matching/join/", headers=headers1, json={})
print(f"Rejoin after leave Status: {rejoin2_res1.status_code}")
if rejoin2_res1.status_code != 200:
    print("Response:", rejoin2_res1.text)

# Now test Two-user match
print("\n--- Test: Two-user match ---")
print("Guest 1 is in queue. Creating Guest 2...")
r2 = requests.post(f"{BASE_URL}/auth/guest/")
user2_token = r2.json().get('access_token') or r2.json().get('access')
user2_id = r2.json().get('user', {}).get('id')
headers2 = {"Authorization": f"Bearer {user2_token}"}
print(f"Guest 2 logged in. ID: {user2_id}")

print("\n--- Completing Profile for Guest 2 ---")
p2 = requests.patch(f"{BASE_URL}/users/me/", headers=headers2, json=profile_data)
if p2.status_code != 200:
    print("Failed to update profile for guest 2:", p2.text)

print("Guest 2 joining queue...")
join_res2 = requests.post(f"{BASE_URL}/matching/join/", headers=headers2, json={})
print(f"Guest 2 Join Status: {join_res2.status_code}")
if join_res2.status_code != 200:
    print("Response:", join_res2.text)

print("\nCheck if they matched by trying to leave...")
# Wait a moment for matching engine
time.sleep(2)
leave_res2 = requests.post(f"{BASE_URL}/matching/leave/", headers=headers2, json={})
print(f"Guest 2 Leave Status: {leave_res2.status_code}")
if leave_res2.status_code == 400: # Probably can't leave because they are matched!
    print("Guest 2 couldn't leave queue (might be matched). Response:", leave_res2.json())

leave_res1_again = requests.post(f"{BASE_URL}/matching/leave/", headers=headers1, json={})
print(f"Guest 1 Leave Status: {leave_res1_again.status_code}")

print("\n====================================")
print("ALL TESTS EXECUTED")
print("====================================")
