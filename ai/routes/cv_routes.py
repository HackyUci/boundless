from flask import Blueprint, request, jsonify
from backend.services.cv_service import CVService 
import base64
import os

cv_bp = Blueprint('cv', __name__)
cv_service = CVService()

@cv_bp.route('/analyze', methods=['POST'])
def analyze_cv():
    try:
        if 'file' in request.files:
            file = request.files['file']
            if file.filename.endswith(('.png', '.jpg', '.jpeg')):
                image_data = file.read()
                result = cv_service.analyze_cv_image(image_data)
            else:
                return jsonify({"error": "Unsupported file format"}), 400
        
        elif 'text' in request.json:
            cv_text = request.json['text']
            result = cv_service.analyze_cv_text(cv_text)
        
        else:
            return jsonify({"error": "No CV data provided"}), 400
        
        return jsonify({"analysis": result})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cv_bp.route('/recommend', methods=['POST'])
def get_recommendations():
    try:
        data = request.json
        field_of_interest = data.get('field', '')
        background = data.get('background', '')
        
        result = gemini_service.get_study_recommendations(field_of_interest, background)
        return jsonify({"recommendations": result})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500