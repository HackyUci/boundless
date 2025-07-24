import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
from datetime import datetime, timedelta

load_dotenv()

class ScholarshipService:
   def __init__(self):
       genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
       self.model = genai.GenerativeModel(os.getenv('GEMINI_AI_MODEL'))
   
   def get_scholarship_timeline(self, university_name, user_country, departure_date, field_of_study=None, budget_limit=None):
       try:
           current_date = datetime.now().strftime("%Y-%m-%d")
           
           prompt = f"""
           Current date: {current_date}
           Target university: {university_name}
           Student nationality: {user_country}
           Desired departure date: {departure_date}
           Field of study: {field_of_study or "any"}
           Budget limit: {budget_limit or "no limit specified"}
           
           Generate a comprehensive scholarship timeline and preparation plan in JSON format:
           
           {{
               "available_scholarships": [
                   {{
                       "scholarship_name": "exact scholarship name",
                       "provider": "government/university/foundation/corporate",
                       "amount_idr": "scholarship amount in IDR",
                       "coverage": "[all the things covered and how much it covers, e.g. tuition(20000000), living expenses(10000000), travel(2000000)]",
                       "eligibility": "[specific requirements for {user_country} students, e.g. Must be an Indonesian citizen, under 40 years of age, hold a Bachelor's degree, have a GPA above 80% from the last institution attended]",
                       "application_deadline": "exact deadline date in YYYY-MM-DD format",
                       "notification_date": "when results are announced int Month, Year format, e.g. January 2024",
                       "fits_timeline": "yes/no based on departure date",
                       "competitiveness": "high/medium/low competition level"
                   }}
               ],
               "application_requirements": {{
                   "documents_needed": [
                       {{
                           "document": "document name",
                           "description": "what this document is",
                           "where_to_get": "simple and specific office/institution in {user_country}, e.g. Visa centers, local government offices, universities",
                           "processing_time": "how long it takes to obtain in days, e.g. 7",
                           "cost_idr": "cost to obtain in IDR",
                           "validity_period": "how long document remains valid in days, weeks, months or years, e.g. 6 months or indefinite"
                       }}
                   ],
                   "tests_required": [
                       {{
                           "test_name": "IELTS/TOEFL/GRE/GMAT etc",
                           "minimum_score": "required or suggested minimum score, e.g. 6.5",
                           "test_centers": "[available centers in {user_country}, e.g. British Council,TOEFL Test Centers]",
                           "registration_cost_idr": "test fee in IDR",
                           "preparation_time": "recommended preparation duration in days, weeks, months or years, e.g. 2 months",
                           "validity_period": "how long scores remain valid in days, weeks, months or years, e.g. 2 years"
                       }}
                   ],
                   "academic_requirements": [
                       {{
                           "requirement": "GPA/transcripts/degree certificates",
                           "minimum_standard": "simple and specific minimum requirement, e.g. 3.0 or above",
                           "verification_needed": "apostille/embassy verification required",
                           "processing_time": "time needed for verification in days, weeks, months or years, e.g. 2 weeks"
                       }}
                   ]
               }},
               "critical_timeline": [
                   {{
                       "date": "specific date in YYYY-MM-DD format",
                       "milestone": "what needs to be completed",
                       "description": "simple but detailed explanation of the task. maximum 2 sentences",
                       "priority": "critical/high/medium",
                   }}
               ],
               "preparation_phases": {{
                   "phase_1_immediate": {{
                       "timeframe": "start date to end date",
                       "tasks": [
                           {{
                               "task": "specific task to complete",
                               "deadline": "when this must be done by",
                               "estimated_cost_idr": "cost in IDR",
                               "dependencies": "what must be done before this task"
                           }}
                       ]
                   }},
                   "phase_2_documentation": {{
                       "timeframe": "start date to end date", 
                       "tasks": [
                           {{
                               "task": "document preparation task",
                               "deadline": "completion deadline",
                               "estimated_cost_idr": "cost in IDR",
                               "where_to_do": "specific location/office"
                           }}
                       ]
                   }},
                   "phase_3_application": {{
                       "timeframe": "start date to end date",
                       "tasks": [
                           {{
                               "task": "application submission task",
                               "deadline": "submission deadline", 
                               "estimated_cost_idr": "application fees in IDR",
                               "submission_method": "online/postal/in-person"
                           }}
                       ]
                   }},
                   "phase_4_post_application": {{
                       "timeframe": "start date to end date",
                       "tasks": [
                           {{
                               "task": "visa application/accommodation booking etc",
                               "deadline": "completion deadline",
                               "estimated_cost_idr": "cost in IDR",
                               "dependencies": "scholarship result/admission letter"
                           }}
                       ]
                   }}
               }},
               "budget_breakdown": {{
                   "preparation_costs": "total cost for document preparation in IDR",
                   "application_fees": "total scholarship and university application fees in IDR", 
                   "test_costs": "total cost for required tests in IDR",
                   "visa_costs": "visa application and related costs in IDR",
                   "travel_costs": "estimated flight costs in IDR",
                   "total_upfront_investment": "total money needed before departure in IDR"
               }},
               "success_optimization": {{
                   "application_tips": ["specific tips to strengthen scholarship application"],
                   "common_mistakes": ["mistakes to avoid based on {user_country} applicants"],
                   "backup_plans": ["alternative scholarships or funding options"],
                   "networking_opportunities": ["ways to connect with alumni or current students"]
               }},
               "country_specific_notes": {{
                   "indonesian_students": "specific advice for Indonesian applicants",
                   "cultural_preparation": "cultural aspects to prepare for",
                   "community_support": "Indonesian student communities at the university"
               }}
           }}
           
           IMPORTANT CONSIDERATIONS:
           1. Account for {user_country} specific document processing times
           2. Consider visa processing delays
           3. Factor in scholarship competition timelines
           4. Include buffer time for unexpected delays
           5. Provide realistic cost estimates in IDR
           6. Consider academic calendar alignment
           7. Account for embassy/consulate processing times in {user_country}
           """
           
           response = self.model.generate_content(prompt)
           return self._parse_response(response.text)
       except Exception as e:
           return {"error": f"Error generating scholarship timeline: {str(e)}"}
   
   def get_university_specific_scholarships(self, university_name, field_of_study=None):
       try:
           current_date = datetime.now().strftime("%Y-%m-%d")
           
           prompt = f"""
           Current date: {current_date}
           Target university: {university_name}
           Field of study: {field_of_study or "any"}
           
           Generate detailed information about scholarships specifically available at {university_name}:
           
           {{
               "university_scholarships": [
                   {{
                       "scholarship_name": "exact name",
                       "type": "merit/need-based/field-specific/international",
                       "amount": "amount or percentage coverage",
                       "amount_idr": "amount in IDR if fixed amount",
                       "eligibility": "specific requirements",
                       "application_process": "how to apply",
                       "deadline": "application deadline",
                       "renewal_conditions": "requirements to maintain scholarship",
                       "number_awarded": "how many scholarships given per year",
                       "contact_information": "scholarship office contact details"
                   }}
               ],
               "external_scholarships": [
                   {{
                       "scholarship_name": "government/foundation scholarships applicable to this university",
                       "provider": "who provides the scholarship",
                       "amount_idr": "amount in IDR",
                       "eligibility": "requirements for Indonesian students",
                       "application_deadline": "deadline date",
                       "university_partnership": "any special partnership with the university"
                   }}
               ],
               "department_specific": [
                   {{
                       "department": "specific department/faculty",
                       "scholarships": ["scholarships available for this department"],
                       "research_assistantships": "RA opportunities and funding",
                       "teaching_assistantships": "TA opportunities and funding"
                   }}
               ],
               "application_strategy": {{
                   "best_scholarships_to_apply": ["top recommendations based on success rate"],
                   "application_timeline": "when to apply for each scholarship",
                   "required_documents": ["documents needed for university scholarships"],
                   "tips_for_success": ["specific tips for this university's scholarships"]
               }}
           }}
           """
           
           response = self.model.generate_content(prompt)
           return self._parse_response(response.text)
       except Exception as e:
           return {"error": f"Error getting university scholarships: {str(e)}"}
   
   def calculate_preparation_timeline(self, departure_date, user_country="Indonesia"):
       try:
           departure_dt = datetime.strptime(departure_date, "%Y-%m-%d")
           current_dt = datetime.now()
           days_until_departure = (departure_dt - current_dt).days
           
           prompt = f"""
           Current date: {current_dt.strftime("%Y-%m-%d")}
           Departure date: {departure_date}
           Days until departure: {days_until_departure}
           Student country: {user_country}
           
           Calculate the optimal preparation timeline working backwards from departure date:
           
           {{
               "timeline_analysis": {{
                   "total_preparation_time": "{days_until_departure} days",
                   "is_sufficient": "yes/no - whether this timeline is realistic",
                   "recommended_minimum": "minimum days needed for proper preparation",
                   "risk_level": "low/medium/high risk of missing deadlines"
               }},
               "backward_timeline": [
                   {{
                       "milestone": "departure/travel",
                       "date": "{departure_date}",
                       "tasks_before": ["final preparations needed before this date"]
                   }},
                   {{
                       "milestone": "visa collection/final documents",
                       "date": "calculated date",
                       "days_before_departure": "number of days before departure",
                       "tasks_before": ["what must be completed before this milestone"]
                   }},
                   {{
                       "milestone": "visa application submission",
                       "date": "calculated date", 
                       "days_before_departure": "number of days before departure",
                       "tasks_before": ["documents and requirements needed"]
                   }},
                   {{
                       "milestone": "scholarship results/university admission",
                       "date": "calculated date",
                       "days_before_departure": "number of days before departure", 
                       "tasks_before": ["application submissions needed"]
                   }},
                   {{
                       "milestone": "application submissions",
                       "date": "calculated date",
                       "days_before_departure": "number of days before departure",
                       "tasks_before": ["document preparation and tests needed"]
                   }},
                   {{
                       "milestone": "document preparation start",
                       "date": "calculated date",
                       "days_before_departure": "number of days before departure",
                       "tasks_before": ["initial research and planning"]
                   }}
               ],
               "critical_deadlines": [
                   {{
                       "deadline_type": "scholarship application",
                       "latest_possible_date": "calculated date",
                       "preparation_needed_before": "what must be ready",
                       "buffer_time_included": "safety margin included"
                   }}
               ],
               "recommendations": {{
                   "start_immediately": ["tasks to start right now"],
                   "start_this_week": ["tasks to start within 7 days"],
                   "start_this_month": ["tasks to start within 30 days"],
                   "emergency_actions": ["if timeline is very tight, what to prioritize"]
               }}
           }}
           """
           
           response = self.model.generate_content(prompt)
           return self._parse_response(response.text)
       except Exception as e:
           return {"error": f"Error calculating timeline: {str(e)}"}
   
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