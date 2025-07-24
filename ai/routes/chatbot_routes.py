from flask import Blueprint, request, jsonify
from services.chatbot_service import ChatbotService
import json

chatbot_bp = Blueprint('chatbot', __name__)
chatbot_service = ChatbotService()

@chatbot_bp.route('/set-context', methods=['POST'])
def set_cv_context():
    try:
        cv_analysis = request.json.get('cv_analysis')
        if not cv_analysis:
            return jsonify({"error": "CV analysis context required"}), 400
        
        chatbot_service.set_cv_context(cv_analysis)
        return jsonify({"status": "Context set successfully"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chatbot_bp.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message')
        if not user_message:
            return jsonify({"error": "Message is required"}), 400
        
        result = chatbot_service.chat(user_message)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chatbot_bp.route('/ask-universities', methods=['POST'])
def ask_universities():
    try:
        data = request.json
        university_name = data.get('university_name')
        specific_question = data.get('question')
        
        if not university_name:
            return jsonify({"error": "University name is required"}), 400
        
        result = chatbot_service.ask_about_universities(university_name, specific_question)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chatbot_bp.route('/ask-scholarships', methods=['POST'])
def ask_scholarships():
    try:
        data = request.json or {}
        scholarship_type = data.get('type')
        country = data.get('country')
        
        result = chatbot_service.ask_about_scholarships(scholarship_type, country)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chatbot_bp.route('/ask-preparation', methods=['POST'])
def ask_preparation():
    try:
        data = request.json or {}
        timeline = data.get('timeline')
        
        result = chatbot_service.ask_about_preparation(timeline)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chatbot_bp.route('/compare', methods=['POST'])
def compare_options():
    try:
        data = request.json
        option1 = data.get('option1')
        option2 = data.get('option2')
        criteria = data.get('criteria')
        
        if not option1 or not option2:
            return jsonify({"error": "Both options are required"}), 400
        
        result = chatbot_service.compare_options(option1, option2, criteria)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chatbot_bp.route('/summary', methods=['GET'])
def get_summary():
    try:
        result = chatbot_service.get_conversation_summary()
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chatbot_bp.route('/clear', methods=['POST'])
def clear_conversation():
    try:
        result = chatbot_service.clear_conversation()
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500