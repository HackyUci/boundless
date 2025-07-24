from flask import Blueprint, request, jsonify
from services.cv_service import CVService
from werkzeug.utils import secure_filename
import os

cv_bp = Blueprint('cv', __name__)
cv_service = CVService()

@cv_bp.route('/analyze', methods=['POST'])
def analyze_cv():
    try:
        if 'file' in request.files:
            file = request.files['file']
            filename = file.filename.lower()
            
            if filename.endswith('.pdf'):
                pdf_data = file.read()
                result = cv_service.analyze_cv_pdf(pdf_data)
            elif filename.endswith(('.png', '.jpg', '.jpeg')):
                image_data = file.read()
                result = cv_service.analyze_cv_image(image_data)
            else:
                return jsonify({"error": "Only PDF, PNG, JPG, JPEG files are supported"}), 400
        
        elif request.json and 'text' in request.json:
            cv_text = request.json['text']
            result = cv_service.analyze_cv_text(cv_text)
        
        else:
            return jsonify({"error": "No CV data provided"}), 400
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cv_bp.route('/analyze-pdf', methods=['POST'])
def analyze_cv_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Only PDF files are supported"}), 400
        
        pdf_data = file.read()
        result = cv_service.analyze_cv_pdf(pdf_data)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cv_bp.route('/analyze-image', methods=['POST'])
def analyze_cv_image():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            return jsonify({"error": "Only PNG, JPG, JPEG files are supported"}), 400
        
        image_data = file.read()
        result = cv_service.analyze_cv_image(image_data)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cv_bp.route('/analyze-text', methods=['POST'])
def analyze_cv_text():
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({"error": "CV text is required"}), 400
        
        cv_text = data['text']
        result = cv_service.analyze_cv_text(cv_text)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cv_bp.route('/scholarship-timeline', methods=['POST'])
def get_scholarship_timeline():
    try:
        data = request.json or {}
        target_countries = data.get('countries', None)
        field_of_study = data.get('field', None)
        
        result = cv_service.get_scholarship_timeline(target_countries, field_of_study)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500