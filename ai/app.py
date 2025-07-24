from flask import Flask, jsonify
from flask_cors import CORS
from routes.cv_routes import cv_bp
import os

app = Flask(__name__)
CORS(app)

app.register_blueprint(cv_bp, url_prefix='/api/cv')

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "CV Analyzer API is running"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)