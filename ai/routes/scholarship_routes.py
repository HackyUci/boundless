from flask import Blueprint, request, jsonify
from services.scholarship_service import ScholarshipService

scholarship_bp = Blueprint('scholarship', __name__)
scholarship_service = ScholarshipService()

@scholarship_bp.route('/timeline', methods=['POST'])
def get_scholarship_timeline():
    try:
        data = request.json
        university_name = data.get('university_name')
        user_country = data.get('user_country')
        departure_date = data.get('departure_date')
        field_of_study = data.get('field_of_study')
        budget_limit = data.get('budget_limit')
        
        if not university_name or not user_country or not departure_date:
            return jsonify({"error": "University name, user country, and departure date are required"}), 400
        
        result = scholarship_service.get_scholarship_timeline(
            university_name, user_country, departure_date, field_of_study, budget_limit
        )
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@scholarship_bp.route('/university-scholarships', methods=['POST'])
def get_university_scholarships():
    try:
        data = request.json
        university_name = data.get('university_name')
        field_of_study = data.get('field_of_study')
        
        if not university_name:
            return jsonify({"error": "University name is required"}), 400
        
        result = scholarship_service.get_university_specific_scholarships(university_name, field_of_study)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@scholarship_bp.route('/preparation-timeline', methods=['POST'])
def calculate_preparation_timeline():
    try:
        data = request.json
        departure_date = data.get('departure_date')
        user_country = data.get('user_country', 'Indonesia')
        
        if not departure_date:
            return jsonify({"error": "Departure date is required"}), 400
        
        result = scholarship_service.calculate_preparation_timeline(departure_date, user_country)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@scholarship_bp.route('/search', methods=['POST'])
def search_scholarships():
    try:
        data = request.json
        field_of_study = data.get('field_of_study')
        target_countries = data.get('target_countries')
        budget_limit = data.get('budget_limit')
        user_country = data.get('user_country', 'Indonesia')
        
        result = scholarship_service.search_scholarships_by_criteria(
            field_of_study, target_countries, budget_limit, user_country
        )
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500