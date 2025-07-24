import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Target, CheckCircle, AlertCircle, Star, MapPin } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

interface FavoriteUniversity {
 id: string;
 name: string;
 country: string;
 city: string;
 programs: Program[];
 applicationDeadline?: string;
 netCost: number;
 matchScore: number;
 ranking?: number;
 createdAt: any;
}

interface Program {
 jurusan: string;
 university: string;
 country: string;
 city: string;
 annual_cost_idr?: number;
 scholarship_amount_idr?: number;
 net_cost_idr?: number;
 fits_budget?: string;
 match_score?: number;
 reasoning?: string;
 world_ranking?: number;
 admission_requirements?: string;
}

interface TimelineStep {
 id: string;
 title: string;
 description: string;
 deadline: string;
 universityName: string;
 priority: 'high' | 'medium' | 'low';
 completed: boolean;
 type: 'application' | 'test' | 'document' | 'scholarship' | 'visa';
 estimatedCost?: number;
}

export const TimelineSection = () => {
 const [user] = useAuthState(auth);
 const [favoriteUniversities, setFavoriteUniversities] = useState<FavoriteUniversity[]>([]);
 const [personalizedTimeline, setPersonalizedTimeline] = useState<TimelineStep[]>([]);
 const [loading, setLoading] = useState(true);
 const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

 useEffect(() => {
   if (user) {
     fetchFavoriteUniversities();
   }
 }, [user]);

 const fetchFavoriteUniversities = async () => {
   try {
     const favoritesRef = collection(db, 'favorites');
     const q = query(
       favoritesRef, 
       where('userId', '==', user?.uid),
       orderBy('createdAt', 'desc')
     );
     const querySnapshot = await getDocs(q);
     
     const favorites: FavoriteUniversity[] = [];
     querySnapshot.forEach((doc) => {
       favorites.push({ id: doc.id, ...doc.data() } as FavoriteUniversity);
     });
     
     setFavoriteUniversities(favorites);
     const timeline = generatePersonalizedTimeline(favorites);
     setPersonalizedTimeline(timeline);
   } catch (error) {
     console.error('Error fetching favorites:', error);
   } finally {
     setLoading(false);
   }
 };

 const generatePersonalizedTimeline = (universities: FavoriteUniversity[]): TimelineStep[] => {
   const steps: TimelineStep[] = [];
   const today = new Date();
   
   universities.forEach((university, index) => {
     const baseDate = new Date(today);
     baseDate.setMonth(baseDate.getMonth() + 1);
     
     steps.push({
       id: `lang-test-${university.id}`,
       title: 'Complete Language Proficiency Test',
       description: `Take IELTS/TOEFL for ${university.name} application`,
       deadline: new Date(baseDate.getTime() + (index * 7 + 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
       universityName: university.name,
       priority: 'high',
       completed: false,
       type: 'test',
       estimatedCost: 3000000
     });

     steps.push({
       id: `documents-${university.id}`,
       title: 'Prepare Application Documents',
       description: `Gather transcripts, certificates, and recommendation letters for ${university.name}`,
       deadline: new Date(baseDate.getTime() + (index * 7 + 21) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
       universityName: university.name,
       priority: 'high',
       completed: false,
       type: 'document'
     });

     steps.push({
       id: `application-${university.id}`,
       title: 'Submit University Application',
       description: `Complete and submit application to ${university.name}`,
       deadline: new Date(baseDate.getTime() + (index * 7 + 45) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
       universityName: university.name,
       priority: 'high',
       completed: false,
       type: 'application',
       estimatedCost: 1500000
     });

     steps.push({
       id: `scholarship-${university.id}`,
       title: 'Apply for Scholarships',
       description: `Apply for available scholarships at ${university.name}`,
       deadline: new Date(baseDate.getTime() + (index * 7 + 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
       universityName: university.name,
       priority: 'medium',
       completed: false,
       type: 'scholarship'
     });

     steps.push({
       id: `visa-${university.id}`,
       title: 'Student Visa Application',
       description: `Apply for student visa to ${university.country}`,
       deadline: new Date(baseDate.getTime() + (index * 7 + 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
       universityName: university.name,
       priority: 'medium',
       completed: false,
       type: 'visa',
       estimatedCost: 5000000
     });
   });

   return steps.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
 };

 const toggleStepCompletion = (stepId: string) => {
   const newCompletedSteps = new Set(completedSteps);
   if (newCompletedSteps.has(stepId)) {
     newCompletedSteps.delete(stepId);
   } else {
     newCompletedSteps.add(stepId);
   }
   setCompletedSteps(newCompletedSteps);
   
   setPersonalizedTimeline(prev => 
     prev.map(step => 
       step.id === stepId 
         ? { ...step, completed: !step.completed }
         : step
     )
   );
 };

 const getPriorityColor = (priority: string) => {
   switch (priority) {
     case 'high': return 'text-red-600 bg-red-50 border-red-200';
     case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
     default: return 'text-green-600 bg-green-50 border-green-200';
   }
 };

 const getTypeIcon = (type: string) => {
   switch (type) {
     case 'application': return <Target className="w-4 h-4" />;
     case 'test': return <AlertCircle className="w-4 h-4" />;
     case 'document': return <Calendar className="w-4 h-4" />;
     case 'scholarship': return <Star className="w-4 h-4" />;
     case 'visa': return <MapPin className="w-4 h-4" />;
     default: return <Clock className="w-4 h-4" />;
   }
 };

 const formatCurrency = (amount: number | undefined) => {
   if (!amount) return '';
   return new Intl.NumberFormat('id-ID', {
     style: 'currency',
     currency: 'IDR',
     minimumFractionDigits: 0,
     maximumFractionDigits: 0,
   }).format(amount);
 };

 const formatDate = (dateString: string) => {
   return new Date(dateString).toLocaleDateString('id-ID', {
     day: 'numeric',
     month: 'long',
     year: 'numeric'
   });
 };

 const isOverdue = (deadline: string) => {
   return new Date(deadline) < new Date();
 };

 if (loading) {
   return (
     <div className="flex items-center justify-center h-64">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
     </div>
   );
 }

 if (favoriteUniversities.length === 0) {
   return (
     <div className="text-center py-12">
       <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
       <h3 className="text-lg font-medium text-gray-900 mb-2">No Favorite Universities</h3>
       <p className="text-gray-600 mb-6">Add universities to favorites to see your personalized timeline</p>
       <Button onClick={() => window.location.href = '/result'}>
         Browse Universities
       </Button>
     </div>
   );
 }

 const completedCount = personalizedTimeline.filter(step => step.completed).length;
 const totalSteps = personalizedTimeline.length;
 const progressPercentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

 return (
   <div className="space-y-6">
     <div className="grid md:grid-cols-3 gap-4">
       <Card>
         <CardContent className="p-6">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-gray-600">Progress</p>
               <p className="text-2xl font-bold text-blue-900">{completedCount}/{totalSteps}</p>
             </div>
             <CheckCircle className="w-8 h-8 text-blue-500" />
           </div>
           <div className="mt-3 bg-gray-200 rounded-full h-2">
             <div 
               className="bg-blue-500 h-2 rounded-full transition-all duration-300"
               style={{ width: `${progressPercentage}%` }}
             ></div>
           </div>
         </CardContent>
       </Card>

       <Card>
         <CardContent className="p-6">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-gray-600">Favorite Universities</p>
               <p className="text-2xl font-bold text-green-900">{favoriteUniversities.length}</p>
             </div>
             <Star className="w-8 h-8 text-yellow-500" />
           </div>
         </CardContent>
       </Card>

       <Card>
         <CardContent className="p-6">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
               <p className="text-2xl font-bold text-red-900">
                 {personalizedTimeline.filter(step => !step.completed && !isOverdue(step.deadline)).length}
               </p>
             </div>
             <AlertCircle className="w-8 h-8 text-red-500" />
           </div>
         </CardContent>
       </Card>
     </div>

     <div className="grid md:grid-cols-2 gap-6">
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Star className="w-5 h-5" />
             Your Favorite Universities
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-3">
             {favoriteUniversities.map((university) => (
               <div key={university.id} className="p-3 border border-gray-200 rounded-lg">
                 <div className="flex justify-between items-start mb-2">
                   <h4 className="font-medium text-gray-900">{university.name}</h4>
                   <Badge variant="outline">{university.matchScore}/10</Badge>
                 </div>
                 <p className="text-sm text-gray-600 flex items-center gap-1">
                   <MapPin className="w-3 h-3" />
                   {university.city}, {university.country}
                 </p>
                 <p className="text-sm font-medium text-green-600 mt-1">
                   {formatCurrency(university.netCost)}/year
                 </p>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>

       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Calendar className="w-5 h-5" />
             Personalized Timeline
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-4 max-h-96 overflow-y-auto">
             {personalizedTimeline.map((step, index) => (
               <div key={step.id} className="relative flex items-start space-x-3">
                 <div className="flex flex-col items-center">
                   <button
                     onClick={() => toggleStepCompletion(step.id)}
                     className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                       step.completed 
                         ? 'bg-green-500 border-green-500 text-white' 
                         : 'border-gray-300 hover:border-gray-400'
                     }`}
                   >
                     {step.completed ? (
                       <CheckCircle className="w-4 h-4" />
                     ) : (
                       getTypeIcon(step.type)
                     )}
                   </button>
                   {index < personalizedTimeline.length - 1 && (
                     <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                   )}
                 </div>
                 
                 <div className="flex-1 min-w-0">
                   <div className={`p-3 rounded-lg border transition-all ${
                     step.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                   } ${isOverdue(step.deadline) && !step.completed ? 'border-red-300 bg-red-50' : ''}`}>
                     <div className="flex justify-between items-start mb-2">
                       <h4 className={`font-medium ${step.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                         {step.title}
                       </h4>
                       <Badge className={getPriorityColor(step.priority)}>
                         {step.priority}
                       </Badge>
                     </div>
                     
                     <p className={`text-sm mb-2 ${step.completed ? 'text-gray-500' : 'text-gray-600'}`}>
                       {step.description}
                     </p>
                     
                     <div className="flex justify-between items-center text-sm">
                       <span className={`flex items-center gap-1 ${
                         isOverdue(step.deadline) && !step.completed ? 'text-red-600 font-medium' : 'text-gray-500'
                       }`}>
                         <Clock className="w-3 h-3" />
                         {formatDate(step.deadline)}
                       </span>
                       {step.estimatedCost && (
                         <span className="font-medium text-gray-700">
                           {formatCurrency(step.estimatedCost)}
                         </span>
                       )}
                     </div>
                     
                     <p className="text-xs text-gray-500 mt-1">
                       For: {step.universityName}
                     </p>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
     </div>
   </div>
 );
};