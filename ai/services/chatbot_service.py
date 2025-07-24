import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
from datetime import datetime

load_dotenv()

class ChatbotService:
   def __init__(self):
       genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
       self.model = genai.GenerativeModel(os.getenv('GEMINI_AI_MODEL'))
       self.conversation_history = []
       self.cv_context = None
       self.analysis_context = None
   
   def set_cv_context(self, cv_analysis_result):
       self.cv_context = cv_analysis_result
       self.analysis_context = cv_analysis_result
       self.conversation_history = []
   
   def chat(self, user_message):
        try:
            context_prompt = self._build_context_prompt()

            full_prompt = f"""
            {context_prompt}

            Previous conversation:
            {self._format_conversation_history()}

            User question: {user_message}

            You're a friendly, conversational assistant who loves chatting about study-related topics, especially about studying abroad or at top universities like Universitas Indonesia (UI). Respond in a casual, engaging tone, like you're talking to a friend. For example, if the user asks, "Tell me about Universitas Indonesia," respond like: "Wow, UI? That's a top-notch choice! It's one of Indonesia's best universities, known for its strong programs in [insert fields]. Are you an Indonesian citizen or coming from abroad? Oh, and do you want the lowdown on stuff like UKT (tuition fees) or admission details?"

            Follow these guidelines:
            - For universities (like UI): Share details about programs, admission requirements, campus vibe, and costs (e.g., UKT for locals or international student fees).
            - For scholarships: List current opportunities, deadlines, and application tips.
            - For countries: Talk about living conditions, culture, and visa requirements.
            - For preparation: Provide clear, step-by-step guidance and timelines.
            - For budget: Break down costs and give practical financial planning tips.
            - For general study abroad: Offer comprehensive, easy-to-follow advice.
            - Personalize responses using the CV context (e.g., user's background, interests, or goals) to make it relevant.
            - Keep the tone light, friendly, and conversational, but pack it with useful info. Avoid formal formatting like bold or italics.
            - If the user seems curious about something specific (e.g., UKT, programs), ask a follow-up question to keep the chat flowing, like "Hey, you want me to dig into the UKT details or maybe the international student process?"

            Example response for "Tell me about Universitas Indonesia":
            "Yo, UI is awesome! It’s like the gold standard in Indonesia, sitting pretty in Depok and Jakarta. Known for killer programs in medicine, engineering, and social sciences. The campus has this cool mix of modern vibes and green spaces. You thinking of applying? Are you from Indonesia or abroad? Oh, and you want details on the UKT fees or maybe how to get in as an international student?"

            Now, respond to the user's question: {user_message}
            """

            response = self.model.generate_content(full_prompt)

            self.conversation_history.append({
                "user": user_message,
                "assistant": response.text,
                "timestamp": datetime.now().isoformat()
            })

            if len(self.conversation_history) > 10:
                self.conversation_history = self.conversation_history[-8:]

            return {
                "response": response.text,
                "conversation_id": len(self.conversation_history)
            }

        except Exception as e:
            return {"error": f"Chat error: {str(e)}"}
   
   def ask_about_universities(self, university_name, specific_question=None):
       try:
           prompt = f"""
           Based on the CV analysis context, provide detailed information about {university_name}.
           
           CV Context: {json.dumps(self.cv_context, indent=2) if self.cv_context else "No CV context available"}
           
           Specific question: {specific_question or "General information about this university"}
           
           Cover:
           - Programs that match the candidate's background
           - Admission requirements and GPA expectations
           - Tuition and living costs
           - Scholarship opportunities at this university
           - Campus life and facilities
           - Location advantages
           - Application deadlines and process
           """
           
           response = self.model.generate_content(prompt)
           return {"response": response.text}
           
       except Exception as e:
           return {"error": f"University query error: {str(e)}"}
   
   def ask_about_scholarships(self, scholarship_type=None, country=None):
       try:
           prompt = f"""
           Based on the CV analysis, provide scholarship information:
           
           CV Context: {json.dumps(self.cv_context, indent=2) if self.cv_context else "No CV context available"}
           
           Scholarship focus: {scholarship_type or "all types"}
           Target country: {country or "any country"}
           Current date: {datetime.now().strftime("%Y-%m-%d")}
           
           Provide:
           - Specific scholarships matching the candidate profile
           - Current application status and deadlines
           - Required documents and preparation steps
           - Tips for strong applications
           - Alternative funding options
           - Success rates and competition level
           """
           
           response = self.model.generate_content(prompt)
           return {"response": response.text}
           
       except Exception as e:
           return {"error": f"Scholarship query error: {str(e)}"}
   
   def ask_about_preparation(self, timeline=None):
       try:
           prompt = f"""
           Create a detailed preparation plan based on the CV analysis:
           
           CV Context: {json.dumps(self.cv_context, indent=2) if self.cv_context else "No CV context available"}
           
           Timeline: {timeline or "next 12 months"}
           Current date: {datetime.now().strftime("%Y-%m-%d")}
           
           Provide a step-by-step preparation plan including:
           - Document preparation checklist
           - Test requirements (IELTS, TOEFL, GRE, GMAT)
           - Application timeline
           - Portfolio or essay preparation
           - Interview preparation
           - Visa application process
           - Financial preparation
           - Monthly milestones
           """
           
           response = self.model.generate_content(prompt)
           return {"response": response.text}
           
       except Exception as e:
           return {"error": f"Preparation query error: {str(e)}"}
   
   def compare_options(self, option1, option2, comparison_criteria=None):
       try:
           prompt = f"""
           Compare these two options based on the CV analysis:
           
           CV Context: {json.dumps(self.cv_context, indent=2) if self.cv_context else "No CV context available"}
           
           Option 1: {option1}
           Option 2: {option2}
           Comparison criteria: {comparison_criteria or "cost, quality, career prospects, admission chances"}
           
           Provide detailed comparison covering:
           - Pros and cons of each option
           - Cost analysis
           - Career outcomes
           - Admission probability
           - Personal fit based on CV
           - Recommendation with reasoning
           """
           
           response = self.model.generate_content(prompt)
           return {"response": response.text}
           
       except Exception as e:
           return {"error": f"Comparison error: {str(e)}"}
   
   def get_conversation_summary(self):
       if not self.conversation_history:
           return {"summary": "No conversation yet"}
       
       try:
           conversation_text = "\n".join([
               f"User: {conv['user']}\nAssistant: {conv['assistant']}\n"
               for conv in self.conversation_history
           ])
           
           prompt = f"""
           Summarize this conversation about study abroad planning:
           
           {conversation_text}
           
           Provide:
           - Key topics discussed
           - Main recommendations given
           - Outstanding questions or next steps
           - Progress in planning process
           """
           
           response = self.model.generate_content(prompt)
           return {"summary": response.text}
           
       except Exception as e:
           return {"error": f"Summary error: {str(e)}"}
   
   def clear_conversation(self):
       self.conversation_history = []
       return {"status": "Conversation cleared"}
   
   def _build_context_prompt(self):
       if not self.cv_context:
           return "No CV analysis context available. Provide general study abroad advice."
       
       return f"""
       You are a study abroad consultant chatbot. Use this CV analysis context to provide personalized advice:
       
       CV Analysis Context:
       {json.dumps(self.cv_context, indent=2)}
       
       Use this information to:
       - Personalize all recommendations
       - Reference specific programs/universities mentioned
       - Consider the candidate's academic background and skills
       - Factor in budget constraints and scholarship opportunities
       - Account for preparation timeline and requirements
       """
   
   def _format_conversation_history(self):
       if not self.conversation_history:
           return "No previous conversation."
       
       formatted = []
       for conv in self.conversation_history[-5:]:
           formatted.append(f"User: {conv['user']}")
           formatted.append(f"Assistant: {conv['assistant'][:200]}...")
       
       return "\n".join(formatted)