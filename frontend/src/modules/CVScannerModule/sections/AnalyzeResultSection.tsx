"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Star,
  MapPin, 
  DollarSign, 
  Shield, 
  Cloud, 
  Users, 
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { TimelineSection } from './TimelineSection';

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

interface Scholarship {
 name: string;
 coverage_idr: number;
 coverage_percentage: number;
 deadline: string;
 application_url: string;
 success_probability: string;
 requirements: string;
}

interface PrepStep {
 action: string;
 deadline: string;
 cost_idr: number;
 priority: string;
}

interface ImprovementArea {
 area: string;
 current_level: string;
 target_level: string;
 action_plan: string;
 timeline: string;
 estimated_cost_idr: number;
}

interface University {
 id: string;
 name: string;
 country: string;
 city: string;
 programs: Program[];
 totalCost: number;
 scholarshipAmount: number;
 netCost: number;
 withinBudget: boolean;
 matchScore: number;
 reasoning: string;
 ranking: number | null;
}

interface AnalysisData {
 recommended_programs?: Program[];
 scholarship_priorities?: Scholarship[];
 preparation_steps?: PrepStep[];
 improvement_areas?: ImprovementArea[];
 budget_breakdown?: any;
 climate_security?: any;
 religious_facilities?: any;
 academic_analysis?: string;
 skills_assessment?: string;
}

export const AnalyzeResultSection = () => {
 const [user] = useAuthState(auth);
 const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
 const [universities, setUniversities] = useState<University[]>([]);
 const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
 const [activeTheme, setActiveTheme] = useState<string>('overview');
 const [favorites, setFavorites] = useState(new Set<string>());
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const router = useRouter();

  useEffect(() => {
    const loadAnalysisData = () => {
      try {
        const storedData = localStorage.getItem('cvAnalysisResult');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.error) {
            setError(parsedData.error);
          } else {
            setAnalysisData(parsedData);
            const transformedUniversities = transformToUniversityView(parsedData);
            setUniversities(transformedUniversities);
            if (transformedUniversities.length > 0) {
              setSelectedUniversity(transformedUniversities[0]);
            }
          }
        } else {
          setError("No analysis data found. Please upload your CV first.");
        }
      } catch (err) {
        setError("Failed to load analysis results.");
      } finally {
        setLoading(false);
      }
    };

   loadAnalysisData();
   if (user) {
     loadUserFavorites();
   }
 }, [user]);

 const loadUserFavorites = async () => {
   try {
     const favoritesRef = collection(db, 'favorites');
     const q = query(favoritesRef, where('userId', '==', user?.uid));
     const querySnapshot = await getDocs(q);
     
     const userFavorites = new Set<string>();
     querySnapshot.forEach((doc) => {
       userFavorites.add(doc.data().universityId);
     });
     
     setFavorites(userFavorites);
   } catch (error) {
     console.error('Error loading favorites:', error);
   }
 };

 const transformToUniversityView = (aiResponse: AnalysisData): University[] => {
   const universitiesMap: { [key: string]: University } = {};
   
   aiResponse.recommended_programs?.forEach((program: Program) => {
     const key = `${program.university}-${program.country}`;
     if (!universitiesMap[key]) {
       universitiesMap[key] = {
         id: key,
         name: program.university,
         country: program.country,
         city: program.city,
         programs: [],
         totalCost: program.annual_cost_idr || 0,
         scholarshipAmount: program.scholarship_amount_idr || 0,
         netCost: program.net_cost_idr || 0,
         withinBudget: program.fits_budget === 'yes',
         matchScore: program.match_score || 0,
         reasoning: program.reasoning || '',
         ranking: program.world_ranking || null
       };
     }
     universitiesMap[key].programs.push(program);
   });
   
   return Object.values(universitiesMap);
 };

 const formatCurrency = (amount: number | undefined) => {
   if (!amount) return 'Not specified';
   return new Intl.NumberFormat('id-ID', {
     style: 'currency',
     currency: 'IDR',
     minimumFractionDigits: 0,
     maximumFractionDigits: 0,
   }).format(amount);
 };

 const addToFavorites = async (university: University) => {
   try {
     await addDoc(collection(db, 'favorites'), {
       userId: user?.uid,
       universityId: university.id,
       name: university.name,
       country: university.country,
       city: university.city,
       programs: university.programs,
       netCost: university.netCost,
       matchScore: university.matchScore,
       ranking: university.ranking,
       createdAt: new Date()
     });
   } catch (error) {
     console.error('Error adding to favorites:', error);
     throw error;
   }
 };

 const removeFromFavorites = async (universityId: string) => {
   try {
     const favoritesRef = collection(db, 'favorites');
     const q = query(
       favoritesRef, 
       where('userId', '==', user?.uid),
       where('universityId', '==', universityId)
     );
     const querySnapshot = await getDocs(q);
     
     querySnapshot.forEach(async (doc) => {
       await deleteDoc(doc.ref);
     });
   } catch (error) {
     console.error('Error removing from favorites:', error);
     throw error;
   }
 };

 const toggleFavorite = async (universityId: string) => {
   if (!user) {
     alert('Please login to add favorites');
     return;
   }

   const university = universities.find(u => u.id === universityId);
   if (!university) return;

   try {
     const newFavorites = new Set(favorites);
     
     if (newFavorites.has(universityId)) {
       await removeFromFavorites(universityId);
       newFavorites.delete(universityId);
     } else {
       await addToFavorites(university);
       newFavorites.add(universityId);
     }
     
     setFavorites(newFavorites);
   } catch (error) {
     console.error('Error updating favorites:', error);
     alert('Failed to update favorites. Please try again.');
   }
 };

 const getMatchColor = (score: number) => {
   if (score >= 8) return 'bg-green-500';
   if (score >= 6) return 'bg-yellow-500';
   return 'bg-red-500';
 };

 const getPriorityColor = (priority: string) => {
   switch (priority) {
     case 'high': return 'text-red-600 bg-red-50 border-red-200';
     case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
     default: return 'text-green-600 bg-green-50 border-green-200';
   }
 };

 const OverviewContent = () => (
   <div className="space-y-6">
     <div className="grid md:grid-cols-3 gap-4">
       <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
         <CardContent className="p-6">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-blue-600">Match Score</p>
               <p className="text-2xl font-bold text-blue-900">{selectedUniversity?.matchScore}/10</p>
             </div>
             <div className={`w-3 h-3 rounded-full ${getMatchColor(selectedUniversity?.matchScore || 0)}`}></div>
           </div>
           <Progress value={(selectedUniversity?.matchScore || 0) * 10} className="mt-3" />
         </CardContent>
       </Card>

       <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
         <CardContent className="p-6">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-green-600">Budget Status</p>
               <p className="text-lg font-bold text-green-900">
                 {selectedUniversity?.withinBudget ? 'Affordable' : 'Scholarship Needed'}
               </p>
             </div>
             <CheckCircle className={`w-6 h-6 ${selectedUniversity?.withinBudget ? 'text-green-500' : 'text-gray-400'}`} />
           </div>
         </CardContent>
       </Card>

       <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
         <CardContent className="p-6">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-purple-600">World Ranking</p>
               <p className="text-2xl font-bold text-purple-900">
                 #{selectedUniversity?.ranking || 'N/A'}
               </p>
             </div>
             <TrendingUp className="w-6 h-6 text-purple-500" />
           </div>
         </CardContent>
       </Card>
     </div>

     <Card>
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <BookOpen className="w-5 h-5" />
           Available Programs
         </CardTitle>
       </CardHeader>
       <CardContent>
         <div className="grid gap-4">
           {selectedUniversity?.programs.map((program, index) => (
             <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
               <div className="flex justify-between items-start mb-2">
                 <h4 className="font-semibold text-gray-900">{program.jurusan}</h4>
                 <Badge variant="outline">{program.match_score}/10 match</Badge>
               </div>
               <p className="text-sm text-gray-600 mb-2">{program.reasoning}</p>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Annual Cost</span>
                 <span className="font-medium">{formatCurrency(program.annual_cost_idr)}</span>
               </div>
             </div>
           ))}
         </div>
       </CardContent>
     </Card>
   </div>
 );

 const BudgetContent = () => (
   <div className="space-y-6">
     <div className="grid md:grid-cols-2 gap-6">
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <DollarSign className="w-5 h-5" />
             Cost Breakdown
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="space-y-3">
             <div className="flex justify-between items-center">
               <span className="text-gray-600">Annual Tuition</span>
               <span className="font-semibold">{formatCurrency(selectedUniversity?.totalCost)}</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-gray-600">Scholarship Available</span>
               <span className="font-semibold text-green-600">-{formatCurrency(selectedUniversity?.scholarshipAmount)}</span>
             </div>
             <div className="border-t pt-3">
               <div className="flex justify-between items-center">
                 <span className="font-medium text-gray-900">Net Annual Cost</span>
                 <span className="text-xl font-bold text-gray-900">{formatCurrency(selectedUniversity?.netCost)}</span>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>

       <Card>
         <CardHeader>
           <CardTitle>Monthly Living Costs</CardTitle>
         </CardHeader>
         <CardContent>
           {analysisData?.budget_breakdown && (
             <div className="space-y-3">
               <div className="flex justify-between items-center">
                 <span className="text-gray-600">Accommodation</span>
                 <span className="font-medium">{formatCurrency(analysisData.budget_breakdown.accommodation_per_month_idr)}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-600">Food & Daily Needs</span>
                 <span className="font-medium">{formatCurrency(analysisData.budget_breakdown.food_per_month_idr)}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-600">Transportation</span>
                 <span className="font-medium">{formatCurrency(analysisData.budget_breakdown.transportation_per_month_idr)}</span>
               </div>
               <div className="border-t pt-3">
                 <div className="flex justify-between items-center">
                   <span className="font-medium text-gray-900">Total Monthly</span>
                   <span className="text-xl font-bold text-gray-900">{formatCurrency(analysisData.budget_breakdown.total_monthly_idr)}</span>
                 </div>
               </div>
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   </div>
 );

 const ScholarshipContent = () => (
   <div className="space-y-6">
     <div className="grid gap-4">
       {analysisData?.scholarship_priorities?.map((scholarship, index) => (
         <Card key={index} className="hover:shadow-lg transition-shadow">
           <CardContent className="p-6">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <h4 className="font-semibold text-lg text-gray-900">{scholarship.name}</h4>
                 <p className="text-gray-600 text-sm mt-1">Coverage: {scholarship.coverage_percentage}%</p>
               </div>
               <Badge className={`${
                 scholarship.success_probability === 'high' ? 'bg-green-100 text-green-800' :
                 scholarship.success_probability === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                 'bg-red-100 text-red-800'
               }`}>
                 {scholarship.success_probability} chance
               </Badge>
             </div>
             
             <div className="grid md:grid-cols-2 gap-4 mb-4">
               <div>
                 <p className="text-sm font-medium text-gray-600">Amount</p>
                 <p className="text-2xl font-bold text-green-600">{formatCurrency(scholarship.coverage_idr)}</p>
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-600">Deadline</p>
                 <p className="text-lg font-semibold text-red-600">{scholarship.deadline}</p>
               </div>
             </div>
             
             <div className="space-y-2">
               <p className="text-sm font-medium text-gray-600">Requirements</p>
               <p className="text-sm text-gray-700">{scholarship.requirements}</p>
             </div>
             
             <Button className="w-full mt-4" onClick={() => window.open(scholarship.application_url, '_blank')}>
               Apply Now
             </Button>
           </CardContent>
         </Card>
       ))}
     </div>
   </div>
 );

 const TimelineContent = () => (
   <TimelineSection />
 );

 const ImprovementContent = () => (
   <div className="space-y-6">
     <div className="grid gap-4">
       {analysisData?.improvement_areas?.map((area, index) => (
         <Card key={index} className="hover:shadow-lg transition-shadow">
           <CardContent className="p-6">
             <div className="flex items-start justify-between mb-4">
               <div>
                 <h4 className="font-semibold text-lg text-gray-900">{area.area}</h4>
                 <p className="text-gray-600 text-sm mt-1">{area.timeline}</p>
               </div>
               <Badge variant="outline">{formatCurrency(area.estimated_cost_idr)}</Badge>
             </div>
             
             <div className="space-y-3">
               <div>
                 <p className="text-sm font-medium text-gray-600">Current Level</p>
                 <p className="text-sm text-gray-700">{area.current_level}</p>
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-600">Target Level</p>
                 <p className="text-sm text-gray-700">{area.target_level}</p>
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-600">Action Plan</p>
                 <p className="text-sm text-gray-700">{area.action_plan}</p>
               </div>
             </div>
           </CardContent>
         </Card>
       ))}
     </div>
   </div>
 );

 const LifestyleContent = () => (
   <div className="space-y-6">
     <div className="grid md:grid-cols-2 gap-6">
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Cloud className="w-5 h-5" />
             Climate & Environment
           </CardTitle>
         </CardHeader>
         <CardContent>
           {analysisData?.climate_security && (
             <div className="space-y-4">
               <div>
                 <p className="text-sm font-medium text-gray-600">Climate</p>
                 <p className="text-gray-700">{analysisData.climate_security.climate}</p>
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-600">Safety Score</p>
                 <div className="flex items-center gap-2">
                   <Shield className="w-4 h-4 text-green-600" />
                   <span className="text-lg font-semibold">{analysisData.climate_security.safety_score}/10</span>
                 </div>
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-600">Clothing Budget</p>
                 <p className="text-lg font-semibold">{formatCurrency(analysisData.climate_security.clothing_budget_idr)}</p>
               </div>
             </div>
           )}
         </CardContent>
       </Card>

       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Users className="w-5 h-5" />
             Religious Facilities
           </CardTitle>
         </CardHeader>
         <CardContent>
           {analysisData?.religious_facilities?.islam && (
             <div className="space-y-3">
               <div>
                 <p className="text-sm font-medium text-gray-600">Islamic Facilities</p>
                 <p className="text-sm text-gray-700">{analysisData.religious_facilities.islam.availability}</p>
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-600">Halal Food</p>
                 <p className="text-sm text-gray-700">{analysisData.religious_facilities.islam.halal_food}</p>
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-600">Prayer Facilities</p>
                 <p className="text-sm text-gray-700">{analysisData.religious_facilities.islam.prayer_rooms}</p>
               </div>
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   </div>
 );

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="text-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
         <p className="text-gray-600">Loading your university matches...</p>
       </div>
     </div>
   );
 }

 if (error) {
   return (
     <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
       <Alert variant="destructive" className="max-w-md">
         <AlertCircle className="w-4 h-4" />
         <AlertDescription>{error}</AlertDescription>
       </Alert>
     </div>
   );
 }

 if (!selectedUniversity) {
   return (
     <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
       <Alert className="max-w-md">
         <AlertCircle className="w-4 h-4" />
         <AlertDescription>No university recommendations available.</AlertDescription>
       </Alert>
     </div>
   );
 }

 return (
   <div className="min-h-screen bg-gray-50">
     <div className="flex">
       <div className="w-80 bg-white border-r border-gray-200 min-h-screen">
         <div className="p-6 border-b border-gray-200">
           <Button 
             variant="ghost" 
             onClick={() => router.back()}
             className="mb-4 -ml-2 hover:bg-gray-100"
           >
             <ArrowLeft className="w-4 h-4 mr-2" />
             Back
           </Button>
           <h2 className="text-xl font-bold text-gray-900">Your Matches</h2>
           <p className="text-gray-600 text-sm mt-1">{universities.length} universities found</p>
         </div>
         
         <div className="p-4 space-y-3">
           {universities.map((university) => (
             <div
               key={university.id}
               className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                 selectedUniversity?.id === university.id
                   ? 'border-blue-500 bg-blue-50 shadow-md'
                   : 'border-gray-200 hover:border-gray-300 bg-white'
               }`}
               onClick={() => setSelectedUniversity(university)}
             >
               <div className="flex justify-between items-start mb-2">
                 <h3 className="font-semibold text-gray-900 text-sm">{university.name}</h3>
                 <div className="flex items-center gap-1">
                   <div className={`w-2 h-2 rounded-full ${getMatchColor(university.matchScore)}`}></div>
                   <span className="text-xs text-gray-600">{university.matchScore}/10</span>
                 </div>
               </div>
               <p className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                 <MapPin className="w-3 h-3" />
                 {university.city}, {university.country}
               </p>
               <div className="flex justify-between items-center">
                 <p className="text-xs font-medium text-gray-700">
                   {formatCurrency(university.netCost)}/year
                 </p>
                 {university.ranking && (
                   <span className="text-xs text-blue-600">#{university.ranking}</span>
                 )}
               </div>
             </div>
           ))}
         </div>
       </div>

       <div className="flex-1">
         <div className="p-8">
           <div className="flex justify-between items-start mb-8">
             <div>
               <h1 className="text-3xl font-bold text-gray-900">{selectedUniversity.name}</h1>
               <p className="text-lg text-gray-600 flex items-center gap-2 mt-2">
                 <MapPin className="w-5 h-5" />
                 {selectedUniversity.city}, {selectedUniversity.country}
               </p>
             </div>
             <Button
               variant="outline"
               onClick={() => toggleFavorite(selectedUniversity.id)}
               className="flex items-center gap-2 hover:bg-gray-50"
               disabled={!user}
             >
               <Star 
                 className={`w-4 h-4 ${
                   favorites.has(selectedUniversity.id) 
                     ? 'fill-yellow-400 text-yellow-400' 
                     : 'text-gray-400'
                 }`} 
               />
               Favorite
             </Button>
           </div>

           <Tabs value={activeTheme} onValueChange={setActiveTheme} className="space-y-6">
             <TabsList className="grid w-full grid-cols-6 h-12">
               <TabsTrigger value="overview" className="flex items-center gap-2">
                 <Target className="w-4 h-4" />
                 Overview
               </TabsTrigger>
               <TabsTrigger value="budget" className="flex items-center gap-2">
                 <DollarSign className="w-4 h-4" />
                 Budget
               </TabsTrigger>
               <TabsTrigger value="scholarships" className="flex items-center gap-2">
                 <Award className="w-4 h-4" />
                 Scholarships
               </TabsTrigger>
               <TabsTrigger value="timeline" className="flex items-center gap-2">
                 <Calendar className="w-4 h-4" />
                 Timeline
               </TabsTrigger>
               <TabsTrigger value="improvement" className="flex items-center gap-2">
                 <Zap className="w-4 h-4" />
                 Improvement
               </TabsTrigger>
               <TabsTrigger value="lifestyle" className="flex items-center gap-2">
                 <Users className="w-4 h-4" />
                 Lifestyle
               </TabsTrigger>
             </TabsList>

             <TabsContent value="overview" className="space-y-6">
               <OverviewContent />
             </TabsContent>

             <TabsContent value="budget" className="space-y-6">
               <BudgetContent />
             </TabsContent>

             <TabsContent value="scholarships" className="space-y-6">
               <ScholarshipContent />
             </TabsContent>

             <TabsContent value="timeline" className="space-y-6">
               <TimelineContent />
             </TabsContent>

             <TabsContent value="improvement" className="space-y-6">
               <ImprovementContent />
             </TabsContent>

             <TabsContent value="lifestyle" className="space-y-6">
               <LifestyleContent />
             </TabsContent>
           </Tabs>
         </div>
       </div>
     </div>
   </div>
 );
};