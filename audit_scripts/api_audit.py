import requests
import time
import sys
import uuid

BASE_URL = "https://foudy.onrender.com"
API_URL = f"{BASE_URL}/api/v1"

def print_result(name, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name} - {detail}")

def test_health():
    try:
        r = requests.get(f"{BASE_URL}/health/")
        passed = r.status_code == 200 and r.json().get("status") == "healthy"
        print_result("Health Check", passed, f"Status: {r.status_code}")
        return passed
    except Exception as e:
        print_result("Health Check", False, str(e))
        return False

def test_auth_flow():
    # 1. Register
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "StrongPassword123!"
    
    # Registration
    r = requests.post(f"{API_URL}/auth/register/", json={
        "email": email,
        "password": password,
        "password_confirm": password,
        "display_name": "Test User"
    })
    
    passed_reg = r.status_code in [201, 200]
    print_result("Registration", passed_reg, f"Status: {r.status_code} Body: {r.text[:100]}")
    
    if not passed_reg:
        return None
        
    # Login
    r = requests.post(f"{API_URL}/auth/login/", json={
        "email": email,
        "password": password
    })
    
    passed_login = r.status_code == 200 and "access_token" in r.json()
    print_result("Login", passed_login, f"Status: {r.status_code}")
    
    if not passed_login:
        return None
        
    tokens = r.json()
    return tokens, email, password

def main():
    print("Starting API Audit...")
    if not test_health():
        print("Health check failed. Backend might not be running.")
        sys.exit(1)
        
    res = test_auth_flow()
    if res:
        tokens, email, pwd = res
        print("Auth flow successful.")
        
if __name__ == "__main__":
    main()
