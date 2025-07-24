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
           
           budget_context = ""
           if budget_limit:
               budget_context += f"Application/Registration budget limit: {budget_limit} IDR\n"
           if monthly_budget:
               budget_context += f"Monthly living budget: {monthly_budget} IDR\n"
           
           prompt = f"""
           Current date: {current_date}
           {budget_context}
           
           Analyze this CV/resume and provide comprehensive recommendations in JSON format.
           IMPORTANT: Only recommend universities and programs that fit within the specified budget constraints.
           
           Return a JSON object with these exact keys:
           {{
               "academic_analysis": "detailed analysis of educational background",
               "skills_assessment": "evaluation of technical and soft skills",
               "recommended_programs": [
                   {{
                       "jurusan": "specific program name (e.g. Computer Science, Mechanical Engineering)",
                       "university": "exact university name (e.g. Technical University of Munich, University of Melbourne)",
                       "country": "country name",
                       "city": "city name",
                       "application_fee_idr": "registration/application fee in IDR",
                       "tuition_per_year_idr": "annual tuition in IDR",
                       "fits_budget": "yes/no based on user budget constraints",
                       "reasoning": "why this fits the candidate and budget"
                   }}
               ],
               "budget_breakdown_idr": {{
                   "tuition_per_year": "amount in IDR",
                   "living_cost_per_month": "amount in IDR", 
                   "food_per_month": "amount in IDR",
                   "accommodation_per_month": "amount in IDR",
                   "transportation_per_month": "amount in IDR",
                   "miscellaneous_per_month": "amount in IDR",
                   "total_estimated_per_year": "total amount in IDR",
                   "application_fees_total": "total registration fees in IDR"
               }},
               "religious_facilities": {{
                   "islam": {{
                       "availability": "available/limited/not available",
                       "nearest_mosque": "name and distance from recommended universities",
                       "halal_food": "availability and options near campus",
                       "prayer_facilities": "on-campus prayer rooms availability"
                   }},
                   "christian": {{
                       "availability": "available/limited/not available", 
                       "nearest_church": "name and distance from recommended universities",
                       "denominations": "available christian denominations nearby",
                       "campus_fellowship": "christian student organizations on campus"
                   }},
                   "other_religions": {{
                       "hindu_buddhist": "temples and centers availability",
                       "interfaith_facilities": "multi-religious spaces on campus"
                   }}
               }},
               "weather_info": {{
                   "climate_type": "tropical/temperate/continental etc",
                   "temperature_range": "average temperature in Celsius",
                   "seasonal_patterns": "detailed description of seasons and what to expect",
                   "special_conditions": "windy/rainy/snowy tendencies and preparation needed",
                   "clothing_budget": "estimated cost for appropriate clothing in IDR"
               }},
               "security_rating": {{
                   "score": "number from 1-10",
                   "explanation": "detailed explanation of safety level for international students", 
                   "discrimination_notes": "any discrimination concerns for Indonesian/Muslim/Asian students",
                   "safety_tips": "practical safety advice for Indonesian students",
                   "emergency_contacts": "important numbers and embassy information"
               }},
               "scholarship_opportunities": [
                   {{
                       "name": "scholarship name",
                       "type": "merit/need/country-specific/government/university",
                       "coverage_idr": "amount covered in IDR",
                       "coverage_percentage": "percentage of total costs covered",
                       "eligibility": "specific requirements",
                       "deadline": "specific deadline date",
                       "application_period": "when applications open",
                       "status": "upcoming/open/closed", 
                       "website": "official application website",
                       "success_rate": "estimated acceptance percentage",
                       "fits_profile": "high/medium/low match with candidate"
                   }}
               ],
               "affordable_universities": [
                   {{
                       "university": "name",
                       "country": "country",
                       "program": "specific program name",
                       "total_cost_per_year_idr": "total annual cost in IDR",
                       "application_fee_idr": "application fee in IDR",
                       "within_budget": "yes/no",
                       "scholarship_potential": "available scholarships for this university"
                   }}
               ],
               "budget_optimization": {{
                   "cheapest_options": "most affordable university options within budget",
                   "best_value": "best quality-to-cost ratio options",
                   "scholarship_dependent": "good options if scholarships are obtained",
                   "budget_stretching_tips": "ways to make budget go further"
               }},
               "preparation_steps": [
                   "specific actionable steps with timeline and costs in IDR"
               ],
               "improvement_areas": [
                   "areas that need enhancement to get scholarships or better programs"
               ]
           }}
           
           CRITICAL REQUIREMENTS:
           1. Only recommend universities where total annual cost (tuition + living) is within budget
           2. Convert ALL costs to IDR (use current exchange rates: 1 USD = 15,800 IDR, 1 EUR = 17,200 IDR)
           3. Be specific about university names and exact programs
           4. Focus on universities with good scholarship opportunities if budget is tight
           5. Provide realistic and current cost estimates
           6. Include application/registration fees in budget calculations
           """
           
           response = self.model.generate_content([prompt, image])
           return self._parse_response(response.text)
       except Exception as e:
           return {"error": f"Error analyzing CV: {str(e)}"}
   
   def analyze_cv_text(self, cv_text, budget_limit=None, monthly_budget=None):
       try:
           current_date = datetime.now().strftime("%Y-%m-%d")
           next_6_months = (datetime.now() + timedelta(days=180)).strftime("%Y-%m-%d")
           
           budget_context = ""
           if budget_limit:
               budget_context += f"Application/Registration budget limit: {budget_limit} IDR\n"
           if monthly_budget:
               budget_context += f"Monthly living budget: {monthly_budget} IDR\n"
           
           prompt = f"""
           Current date: {current_date}
           Target period for scholarships: Now until {next_6_months}
           {budget_context}
           
           Analyze this CV content and provide comprehensive recommendations in JSON format.
           IMPORTANT: Only recommend universities and programs that fit within the specified budget constraints.
           
           CV Content: {cv_text}
           
           Return a JSON object with these exact keys:
           {{
               "academic_analysis": "detailed analysis of educational background with GPA/grades assessment",
               "skills_assessment": "evaluation of technical and soft skills with market relevance",
               "recommended_programs": [
                   {{
                       "jurusan": "specific program name (e.g. Computer Science, Mechanical Engineering)",
                       "university": "exact university name (e.g. Technical University of Munich, University of Melbourne)",
                       "country": "country name", 
                       "city": "city name",
                       "application_fee_idr": "registration/application fee in IDR",
                       "tuition_per_year_idr": "annual tuition in IDR",
                       "fits_budget": "yes/no based on user budget constraints",
                       "world_ranking": "university ranking if available",
                       "program_ranking": "specific program ranking",
                       "reasoning": "why this fits the candidate profile and budget",
                       "admission_requirements": "specific requirements like GPA, IELTS, etc"
                   }}
               ],
               "budget_breakdown_idr": {{
                   "tuition_per_year": "amount in IDR",
                   "living_cost_per_month": "amount in IDR including rent, utilities",
                   "food_per_month": "amount in IDR with halal options considered", 
                   "accommodation_per_month": "amount in IDR for student housing",
                   "transportation_per_month": "amount in IDR for local transport",
                   "miscellaneous_per_month": "amount in IDR for books, entertainment, etc",
                   "health_insurance_per_year": "required health insurance in IDR",
                   "visa_costs": "visa application and renewal costs in IDR",
                   "total_estimated_per_year": "total amount in IDR",
                   "application_fees_total": "total registration fees for recommended programs in IDR"
               }},
               "religious_facilities": {{
                   "islam": {{
                       "availability": "detailed availability in recommended cities",
                       "nearest_mosques": "specific mosque names and distances from universities",
                       "halal_food": "halal restaurant options and grocery stores near campuses",
                       "prayer_facilities": "on-campus prayer rooms and wudu facilities",
                       "islamic_community": "Indonesian/Malaysian Muslim student associations"
                   }},
                   "christian": {{
                       "availability": "church availability in recommended cities",
                       "nearest_churches": "specific church names and distances from universities", 
                       "denominations": "available christian denominations (Catholic, Protestant, etc)",
                       "campus_fellowship": "christian student organizations and activities",
                       "indonesian_christian_community": "Indonesian christian communities abroad"
                   }},
                   "other_religions": {{
                       "hindu_buddhist": "temples and centers with specific locations",
                       "interfaith_facilities": "multi-religious spaces and dialogue centers"
                   }}
               }},
               "weather_info": {{
                   "climate_type": "specific climate classification",
                   "temperature_range": "monthly temperature ranges in Celsius",
                   "seasonal_patterns": "what to expect each season with preparation tips",
                   "special_conditions": "wind, rain, snow patterns and intensity",
                   "clothing_budget": "estimated seasonal clothing costs in IDR",
                   "adaptation_tips": "how Indonesian students can adapt to the climate"
               }},
               "security_rating": {{
                   "score": "number from 1-10 with explanation",
                   "explanation": "detailed safety analysis for international students",
                   "discrimination_notes": "specific concerns for Indonesian/Muslim/Asian students with recent incidents if any",
                   "safety_tips": "practical safety advice for Indonesian students studying there",
                   "emergency_contacts": "local emergency numbers and Indonesian embassy/consulate contacts",
                   "safe_areas": "recommended areas to live near universities",
                   "areas_to_avoid": "areas to be cautious about"
               }},
               "scholarship_opportunities": [
                   {{
                       "name": "exact scholarship name",
                       "type": "merit/need/country-specific/government/university/corporate",
                       "coverage_idr": "exact amount covered in IDR",
                       "coverage_percentage": "percentage of total costs covered",
                       "eligibility": "detailed requirements with GPA, IELTS scores, etc",
                       "deadline": "exact deadline date",
                       "application_period": "when applications typically open",
                       "status": "current status based on calendar date",
                       "website": "direct application website URL",
                       "success_rate": "estimated acceptance percentage for Indonesian students",
                       "fits_profile": "detailed assessment of candidate match",
                       "required_documents": "specific documents needed",
                       "application_tips": "tips to strengthen application"
                   }}
               ],
               "affordable_universities": [
                   {{
                       "university": "exact university name",
                       "country": "country",
                       "city": "city",
                       "program": "specific program name",
                       "total_cost_per_year_idr": "total annual cost including living in IDR",
                       "application_fee_idr": "application fee in IDR",
                       "within_budget": "yes/no with explanation",
                       "scholarship_potential": "available scholarships with amounts",
                       "quality_rating": "academic quality assessment",
                       "employment_prospects": "job prospects after graduation"
                   }}
               ],
               "budget_optimization": {{
                   "cheapest_options": "most affordable universities within budget with quality assessment",
                   "best_value": "best quality-to-cost ratio options",
                   "scholarship_dependent": "excellent options if scholarships are obtained",
                   "budget_stretching_tips": "practical ways to reduce costs while studying",
                   "part_time_work": "legal part-time work opportunities for students",
                   "financial_planning": "month-by-month budget planning advice"
               }},
               "scholarship_calendar": {{
                   "urgent_deadlines": "scholarships with deadlines in next 2 months",
                   "upcoming_applications": "scholarships opening in next 3 months",
                   "annual_cycles": "recurring scholarship patterns with typical dates",
                   "preparation_timeline": "when to start preparing for each scholarship"
               }},
               "preparation_steps": [
                   "specific actionable steps with timeline, costs in IDR, and priority levels"
               ],
               "improvement_areas": [
                   "areas needing enhancement with specific improvement strategies and timelines"
               ]
           }}
           
           CRITICAL REQUIREMENTS:
           1. Only recommend universities where total costs are within specified budgets
           2. Convert ALL costs to IDR using current rates: 1 USD = 15,800 IDR, 1 EUR = 17,200 IDR, 1 GBP = 19,500 IDR
           3. Be specific about university names, exact programs, and cities
           4. Include real scholarship names with actual websites and deadlines
           5. Provide detailed religious facility information with specific locations
           6. Focus heavily on budget optimization and affordable options
           7. Consider application fees in total budget calculations
           8. Prioritize universities with good scholarship opportunities if budget is tight
           """
           
           response = self.model.generate_content(prompt)
           return self._parse_response(response.text)
       except Exception as e:
           return {"error": f"Error analyzing CV: {str(e)}"}
   
   def get_scholarship_timeline(self, target_countries=None, field_of_study=None, budget_limit=None):
       try:
           current_date = datetime.now().strftime("%Y-%m-%d")
           
           budget_context = f"Budget constraint: {budget_limit} IDR" if budget_limit else "No budget constraint specified"
           
           prompt = f"""
           Current date: {current_date}
           Target countries: {target_countries or "any"}
           Field of study: {field_of_study or "any"}
           {budget_context}
           
           Generate a comprehensive scholarship timeline for Indonesian students in JSON format:
           
           {{
               "immediate_deadlines": [
                   {{
                       "scholarship": "exact scholarship name",
                       "deadline": "exact date",
                       "days_remaining": "number of days",
                       "country": "target country",
                       "amount_idr": "scholarship amount in IDR",
                       "field_match": "relevance percentage to specified field",
                       "budget_impact": "how this affects total budget needs"
                   }}
               ],
               "next_3_months": [
                   {{
                       "scholarship": "exact scholarship name",
                       "opening_date": "when applications open",
                       "deadline": "deadline date",
                       "amount_idr": "scholarship amount in IDR",
                       "preparation_checklist": ["specific required documents", "tests needed with dates"],
                       "preparation_cost_idr": "estimated cost to prepare application in IDR"
                   }}
               ],
               "annual_patterns": [
                   {{
                       "scholarship": "exact scholarship name",
                       "typical_opening": "month when applications typically open",
                       "typical_deadline": "month when applications typically close",
                       "next_cycle": "estimated next opening date",
                       "amount_idr": "typical scholarship amount in IDR",
                       "success_rate": "estimated acceptance rate for Indonesian students"
                   }}
               ],
               "budget_focused_scholarships": [
                   {{
                       "scholarship": "scholarship name",
                       "covers_full_cost": "yes/no",
                       "coverage_amount_idr": "amount in IDR",
                       "remaining_self_funding_idr": "amount student needs to cover in IDR",
                       "fits_user_budget": "yes/no based on user's budget limit"
                   }}
               ]
           }}
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