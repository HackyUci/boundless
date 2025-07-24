from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.cv_routes import cv_bp
from routes.chatbot_routes import chatbot_bp
from routes.scholarship_routes import scholarship_bp
import os

app = Flask(__name__)
CORS(app)

app.register_blueprint(cv_bp, url_prefix='/api/cv')
app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
app.register_blueprint(scholarship_bp, url_prefix='/api/scholarship')

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "CV Analyzer API is running"})

@app.route('/api/health', methods=['GET'])
def api_health():
    return jsonify({
        "status": "healthy",
        "endpoints": {
            "cv_analysis": "/api/cv/analyze",
            "chatbot": "/api/chatbot/chat",
            "scholarship_timeline": "/api/scholarship/timeline",
            "university_scholarships": "/api/scholarship/university-scholarships",
            "preparation_timeline": "/api/scholarship/preparation-timeline"
        }
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)