import google.generativeai as genai
import os
from dotenv import load_dotenv
import base64
from PIL import Image
import io
import json
from datetime import datetime, timedelta
import PyPDF2
from pdf2image import convert_from_bytes
import fitz

load_dotenv()

class CVService:
    def __init__(self):
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.model = genai.GenerativeModel(os.getenv('GEMINI_AI_MODEL'))
    
    def _get_budget_classification(self, budget_limit=None, monthly_budget=None):
        if monthly_budget:
            if monthly_budget < 15000000:
                return "low"
            elif monthly_budget < 50000000:
                return "medium"
            else:
                return "high"
        elif budget_limit:
            if budget_limit < 200000000:
                return "low"
            elif budget_limit < 800000000:
                return "medium"
            else:
                return "high"
        return "medium"
    
    def _get_budget_strategy(self, tier):
        strategies = {
            "low": "BUDGET FRIENDLY: Focus ONLY on full scholarships (80%+ coverage), free universities, work-study programs. Prioritize countries with ultra-low living costs like Taiwan, Poland, Czech Republic.",
            "medium": "BALANCE: Mix affordable universities with partial scholarships. Consider European public universities and Asian options with good scholarship programs.",
            "high": "PREMIUM: Include top-tier universities. Focus on academic prestige and career prospects over cost constraints."
        }
        return strategies.get(tier, strategies["medium"])

    def analyze_cv_pdf(self, pdf_data, budget_limit=None, monthly_budget=None):
        try:
            pdf_text = self._extract_text_from_pdf(pdf_data)
            if pdf_text.strip():
                return self.analyze_cv_text(pdf_text, budget_limit, monthly_budget)
            else:
                pdf_images = self._convert_pdf_to_images(pdf_data)
                if pdf_images:
                    return self.analyze_cv_image(pdf_images[0], budget_limit, monthly_budget)
                else:
                    return {"error": "Could not extract content from PDF"}
        except Exception as e:
            return {"error": f"Error processing PDF: {str(e)}"}
    
    def _extract_text_from_pdf(self, pdf_data):
        try:
            pdf_document = fitz.open(stream=pdf_data, filetype="pdf")
            text = ""
            for page_num in range(pdf_document.page_count):
                page = pdf_document[page_num]
                text += page.get_text()
            pdf_document.close()
            return text
        except:
            try:
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_data))
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
                return text
            except:
                return ""
    
    def _convert_pdf_to_images(self, pdf_data):
        try:
            images = convert_from_bytes(pdf_data, first_page=1, last_page=1)
            if images:
                img_byte_arr = io.BytesIO()
                images[0].save(img_byte_arr, format='PNG')
                return [img_byte_arr.getvalue()]
            return []
        except:
            return []
    
    def analyze_cv_image(self, image_data, budget_limit=None, monthly_budget=None):
        try:
            image = Image.open(io.BytesIO(image_data))
            current_date = datetime.now().strftime("%Y-%m-%d")
            
            budget_tier = self._get_budget_classification(budget_limit, monthly_budget)
            budget_strategy = self._get_budget_strategy(budget_tier)
            
            budget_context = ""
            if budget_limit:
                budget_context += f"Total Budget Limit: {budget_limit:,} IDR\n"
            if monthly_budget:
                budget_context += f"Monthly Budget: {monthly_budget:,} IDR\n"
            
            prompt = f"""
Current Date: {current_date}
{budget_context}
Budget Classification: {budget_tier.upper()}
Strategy: {budget_strategy}

CRITICAL INSTRUCTIONS:
- Be CONCISE and ACTIONABLE only
- No marketing fluff or lengthy explanations
- Focus on PRACTICAL recommendations
- For LOW budget: Only recommend if 80%+ scholarship OR total cost <200M IDR/year

Analyze this CV and return ONLY this JSON structure:
{{
    "academic_analysis": "Maximum 2 sentences. Key academic strengths + GPA assessment",
    "skills_assessment": "Maximum 2 sentences. Most relevant skills + critical gaps",
    "recommended_programs": [
        {{
            "university": "Exact university name",
            "jurusan": "Specific program name",
            "country": "Country",
            "city": "City", 
            "annual_cost_idr": 250000000,
            "scholarship_amount_idr": 200000000,
            "net_cost_idr": 50000000,
            "fits_budget": "yes/no",
            "match_score": 8,
            "reasoning": "1 sentence why this fits"
        }}
    ],
    "scholarship_priorities": [
        {{
            "name": "Exact scholarship name",
            "coverage_idr": 300000000,
            "coverage_percentage": 90,
            "deadline": "2025-03-15",
            "application_url": "https://exact-website.com",
            "success_probability": "high/medium/low",
            "requirements": "GPA 3.5+ IELTS 7.0+"
        }}
    ],
    "budget_breakdown": {{
        "tuition_per_year_idr": 150000000,
        "living_per_month_idr": 12000000,
        "total_per_year_idr": 294000000,
        "scholarship_potential_idr": 200000000,
        "net_annual_cost_idr": 94000000
    }},
    "preparation_steps": [
        {{
            "action": "Take IELTS Academic test",
            "deadline": "Within 3 months",
            "cost_idr": 3200000,
            "priority": "high"
        }},
        {{
            "action": "Prepare scholarship application essays",
            "deadline": "Within 6 weeks", 
            "cost_idr": 500000,
            "priority": "high"
        }}
    ],
    "improvement_areas": [
        {{
            "area": "English proficiency",
            "current_level": "IELTS equivalent ~6.0",
            "target_level": "IELTS 7.0+ for top scholarships",
            "action_plan": "Intensive English course + practice tests",
            "timeline": "3-4 months",
            "estimated_cost_idr": 5000000
        }}
    ],
    "religious_facilities": {{
        "islam": {{
            "availability": "Available/Limited/Not Available",
            "mosque_distance": "2km from campus",
            "halal_food": "Many options available",
            "prayer_rooms": "Available on campus"
        }}
    }},
    "climate_security": {{
        "climate": "Temperate, 5-25°C year-round",
        "safety_score": 8,
        "clothing_budget_idr": 8000000,
        "adaptation_difficulty": "Medium for Indonesian students"
    }}
}}

BUDGET TIER RULES:
- LOW (<15M/month): ONLY recommend if net cost after scholarship <10M IDR/month
- MEDIUM (15-50M/month): Focus on 50%+ scholarships + affordable countries  
- HIGH (>50M/month): Include premium options, focus on ranking

Exchange rates: 1 USD = 15,800 IDR, 1 EUR = 17,200 IDR, 1 GBP = 19,500 IDR

KEEP IT SHORT AND ACTIONABLE!
"""
            
            response = self.model.generate_content([prompt, image])
            return self._parse_response(response.text)
        except Exception as e:
            return {"error": f"Error analyzing CV: {str(e)}"}
    
    def analyze_cv_text(self, cv_text, budget_limit=None, monthly_budget=None):
        try:
            current_date = datetime.now().strftime("%Y-%m-%d")
            
            budget_tier = self._get_budget_classification(budget_limit, monthly_budget)
            budget_strategy = self._get_budget_strategy(budget_tier)
            
            budget_context = ""
            if budget_limit:
                budget_context += f"Total Budget Limit: {budget_limit:,} IDR\n"
            if monthly_budget:
                budget_context += f"Monthly Budget: {monthly_budget:,} IDR\n"
            
            prompt = f"""
Current Date: {current_date}
{budget_context}
Budget Classification: {budget_tier.upper()}
Strategy: {budget_strategy}

CV Content: {cv_text}

CRITICAL INSTRUCTIONS:
- Be CONCISE and ACTIONABLE only
- No marketing language or lengthy descriptions
- Focus on PRACTICAL next steps
- For LOW budget: Only recommend if 80%+ scholarship available

Return ONLY this JSON structure:
{{
    "academic_analysis": "Maximum 2 sentences. Academic background assessment + GPA evaluation",
    "skills_assessment": "Maximum 2 sentences. Key marketable skills + major gaps identified",
    "recommended_programs": [
        {{
            "university": "Exact university name (e.g. University of Warsaw)",
            "jurusan": "Specific program (e.g. Computer Science MSc)",
            "country": "Country",
            "city": "City",
            "annual_cost_idr": 180000000,
            "scholarship_amount_idr": 150000000,
            "net_cost_idr": 30000000,
            "fits_budget": "yes/no",
            "match_score": 9,
            "world_ranking": 300,
            "reasoning": "1 sentence explanation"
        }}
    ],
    "scholarship_priorities": [
        {{
            "name": "Exact scholarship name (e.g. Erasmus Mundus Joint Masters)",
            "coverage_idr": 400000000,
            "coverage_percentage": 100,
            "deadline": "2025-01-15",
            "application_url": "https://direct-application-link.com",
            "success_probability": "medium",
            "requirements": "Bachelor 3.5+ GPA, IELTS 7.0, relevant experience",
            "documents_needed": "CV, motivation letter, transcripts, 2 references"
        }}
    ],
    "budget_breakdown": {{
        "average_tuition_idr": 120000000,
        "average_living_monthly_idr": 15000000,
        "total_annual_cost_idr": 300000000,
        "best_scholarship_coverage_idr": 250000000,
        "minimum_self_funding_idr": 50000000
    }},
    "preparation_steps": [
        {{
            "action": "Complete IELTS Academic test",
            "deadline": "By 2025-12-01",
            "cost_idr": 3200000,
            "priority": "high"
        }},
        {{
            "action": "Get official transcript translations",
            "deadline": "By 2025-11-15",
            "cost_idr": 1500000,
            "priority": "high"
        }},
        {{
            "action": "Draft scholarship motivation letters",
            "deadline": "By 2025-11-30",
            "cost_idr": 500000,
            "priority": "medium"
        }}
    ],
    "improvement_areas": [
        {{
            "area": "Academic English writing",
            "current_level": "Intermediate (estimated IELTS 6.0 writing)",
            "target_level": "Advanced (IELTS 7.0+ writing for competitive scholarships)",
            "action_plan": "Online academic writing course + weekly practice essays",
            "timeline": "4-6 months intensive study",
            "estimated_cost_idr": 4000000
        }},
        {{
            "area": "Research experience",
            "current_level": "Limited undergraduate projects only", 
            "target_level": "Published research or significant project portfolio",
            "action_plan": "Join research group, complete capstone project, aim for publication",
            "timeline": "6-12 months",
            "estimated_cost_idr": 2000000
        }}
    ],
    "religious_facilities": {{
        "islam": {{
            "availability": "Available in major cities",
            "mosque_distance": "1-3km average from campuses",
            "halal_food": "Widely available in recommended countries",
            "prayer_rooms": "Most universities provide interfaith spaces",
            "community": "Active Indonesian Muslim student associations"
        }},
        "christian": {{
            "availability": "Widely available",
            "church_distance": "Walking distance in most cities",
            "denominations": "Catholic, Protestant, Orthodox available"
        }}
    }},
    "climate_security": {{
        "climate_type": "Temperate continental",
        "temperature_range": "-5°C to 25°C seasonal variation",
        "safety_score": 8,
        "clothing_budget_idr": 12000000,
        "adaptation_tips": "Invest in quality winter clothing, gradual climate adjustment"
    }}
}}

STRICT BUDGET COMPLIANCE:
- LOW BUDGET: Net cost must be <120M IDR/year after scholarships
- MEDIUM BUDGET: Target 50%+ scholarship coverage
- HIGH BUDGET: Focus on academic prestige + career ROI

Exchange rates: 1 USD = 15,800 IDR, 1 EUR = 17,200 IDR, 1 GBP = 19,500 IDR

NO FLUFF - ACTIONABLE ONLY!
"""
            
            response = self.model.generate_content(prompt)
            return self._parse_response(response.text)
        except Exception as e:
            return {"error": f"Error analyzing CV: {str(e)}"}
    
    def get_scholarship_timeline(self, target_countries=None, field_of_study=None, budget_limit=None):
        try:
            current_date = datetime.now().strftime("%Y-%m-%d")
            budget_tier = self._get_budget_classification(budget_limit, None)
            
            prompt = f"""
Current Date: {current_date}
Target Countries: {target_countries or "Global"}
Field of Study: {field_of_study or "Any"}
Budget Tier: {budget_tier.upper()}

Generate scholarship timeline for Indonesian students. Be CONCISE and ACTIONABLE.

Return ONLY this JSON:
{{
    "urgent_deadlines": [
        {{
            "scholarship": "Exact name",
            "deadline": "2025-01-31",
            "days_remaining": 45,
            "coverage_idr": 400000000,
            "application_url": "https://direct-link.com",
            "success_rate": "15% for Indonesian students"
        }}
    ],
    "upcoming_applications": [
        {{
            "scholarship": "Exact name",
            "opens": "2025-02-01",
            "deadline": "2025-06-30", 
            "coverage_idr": 350000000,
            "preparation_time_needed": "3-4 months",
            "key_requirements": "GPA 3.7+, IELTS 7.5+, research experience"
        }}
    ],
    "budget_focused_options": [
        {{
            "scholarship": "Full coverage scholarship name",
            "covers_everything": "yes",
            "amount_idr": 500000000,
            "remaining_costs_idr": 20000000,
            "fits_low_budget": "yes"
        }}
    ]
}}

Focus on PRACTICAL deadlines and REAL scholarship names with ACTUAL websites.
"""
            
            response = self.model.generate_content(prompt)
            return self._parse_response(response.text)
        except Exception as e:
            return {"error": f"Error getting scholarship timeline: {str(e)}"}
    
    def _parse_response(self, response_text):
        try:
            response_text = response_text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            return json.loads(response_text)
        except json.JSONDecodeError:
            try:
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                if start_idx != -1 and end_idx != -1:
                    json_str = response_text[start_idx:end_idx]
                    return json.loads(json_str)
            except:
                pass
            
            return {
                "error": "Failed to parse AI response",
                "raw_response": response_text
            }