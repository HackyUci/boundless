import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:5050/api"

def check_server():
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✓ Server is running")
            print("Available endpoints:", response.json().get("endpoints"))
            return True
        else:
            print("✗ Server responded with error:", response.status_code)
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Server is not running. Please start with: python app.py")
        return False

def test_scholarship_timeline():
    print("=== Testing Scholarship Timeline ===")
    
    test_data = {
        "university_name": "Technical University of Munich",
        "user_country": "Indonesia", 
        "departure_date": "2025-09-01",
        "field_of_study": "Computer Science",
        "budget_limit": "500000000"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/scholarship/timeline", json=test_data)
        print("Response Status:", response.status_code)
        
        if response.status_code == 200:
            result = response.json()
            print("Timeline Result:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
            if "available_scholarships" in result:
                print(f"\nFound {len(result['available_scholarships'])} scholarships")
                
            if "latest_start_date" in result:
                print(f"\nLatest start date: {result['latest_start_date'].get('absolute_latest')}")
                print(f"Recommended start: {result['latest_start_date'].get('recommended_start')}")
        else:
            print("Error response:", response.text)
            
    except Exception as e:
        print(f"Error testing scholarship timeline: {e}")

def run_all_tests():
    print("Starting Scholarship Service Tests...")
    print("=" * 50)
    
    if not check_server():
        return
    
    try:
        test_scholarship_timeline()
        print("\n" + "=" * 50)
        print("Tests completed!")
        
    except Exception as e:
        print(f"Test suite error: {e}")

if __name__ == "__main__":
    run_all_tests()