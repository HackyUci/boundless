import json
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.cv_service import CVService  

def test_cv_analysis():
    cv_service = CVService()
    try:
        pdf_path = os.path.join(os.path.dirname(__file__), 'test_cv.pdf')
        with open(pdf_path, "rb") as f:
            pdf_data = f.read()
        
        budget_limit = 50_000_000  
        monthly_budget = 5_000_000  
        
        result = cv_service.analyze_cv_pdf(pdf_data, budget_limit, monthly_budget)
        return result
    except Exception as e:
        return {"error": f"Failed to test CV analysis: {str(e)}"}

def test_scholarship_timeline():
    cv_service = CVService()
    
    try: 
        target_countries = ["Germany", "Australia", "Canada"]
        field_of_study = "Computer Science"
        budget_limit = 50_000_000  
        result = cv_service.get_scholarship_timeline(target_countries, field_of_study, budget_limit)
        return result
    except Exception as e:
        return {"error": f"Failed to test scholarship timeline: {str(e)}"}

if __name__ == "__main__": 
    cv_result = test_cv_analysis()
    print("CV Analysis Result:", json.dumps(cv_result, indent=2))
    
    scholarship_result = test_scholarship_timeline()
    print("Scholarship Timeline Result:", json.dumps(scholarship_result, indent=2))