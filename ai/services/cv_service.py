import google.generativeai as genai
import os
from dotenv import load_dotenv
import base64
from PIL import Image
import io

load_dotenv()

class CVService:
    def __init__(self):
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.model = genai.GenerativeModel(os.getenv('GEMINI_AI_MODEL'))
    
    def analyze_cv_image(self, image_data):
        try:
            image = Image.open(io.BytesIO(image_data))
            
            prompt = """
            Analyze this CV/resume and provide detailed recommendations:
            
            1. Academic Background Analysis
            2. Skills Assessment
            3. Recommended Study Programs (Jurusan)
            4. Suitable International Universities
            5. Preparation Steps
            6. Areas for Improvement
            
            Provide specific, actionable advice.
            """
            
            response = self.model.generate_content([prompt, image])
            return response.text
        except Exception as e:
            return f"Error analyzing CV: {str(e)}"
    
    def analyze_cv_text(self, cv_text):
        try:
            prompt = f"""
            Analyze this CV content and provide recommendations:
            
            CV Content: {cv_text}
            
            Provide:
            1. Academic Background Analysis
            2. Skills Assessment  
            3. Recommended Study Programs (Jurusan)
            4. Suitable International Universities
            5. Preparation Steps
            6. Areas for Improvement
            
            Be specific and actionable.
            """
            
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error analyzing CV: {str(e)}"