import requests
import time

BASE_URL = "https://foudy.onrender.com/api/v1"

def test_auth():
    print("1. Testing Registration...")
    unique_email = f"prod_test_{int(time.time())}@example.com"
    res = requests.post(f"{BASE_URL}/auth/register/", json={
        "email": unique_email,
        "password": "TestPassword123!",
        "display_name": "ProdTestUser"
    })
    print(f"Register status: {res.status_code}")
    print(res.text)

    print("\n2. Testing Login...")
    res = requests.post(f"{BASE_URL}/auth/login/", json={
        "email": unique_email,
        "password": "TestPassword123!"
    })
    print(f"Login status: {res.status_code}")
    
    if res.status_code == 200:
        data = res.json()
        print("Login successful. Received access_token.")
        
        print("\n3. Testing JWT Refresh...")
        refresh_res = requests.post(f"{BASE_URL}/auth/refresh/", json={}, cookies=res.cookies)
        print(f"Refresh status: {refresh_res.status_code}")
        print(refresh_res.text)

if __name__ == "__main__":
    test_auth()
