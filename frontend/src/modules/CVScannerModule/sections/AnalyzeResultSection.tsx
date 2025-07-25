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
  ArrowRight,
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
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { CVAnalysisResult, UniversityOption } from '../interface';

export const AnalyzeResultSection = () => {
  const { user } = useAuth(); 
  const [analysisData, setAnalysisData] = useState<CVAnalysisResult | null>(null);
  const [universityOptions, setUniversityOptions] = useState<UniversityOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<UniversityOption | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [favorites, setFavorites] = useState(new Set<string>());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadAnalysisData();
    if (user) {
      loadUserFavorites();
    }
  }, [user]);

  const loadAnalysisData = () => {
    try {
      const storedData = localStorage.getItem('cvAnalysisResult');
      if (!storedData) {
        setError("No analysis data found. Please upload your CV first.");
        setLoading(false);
        return;
      }

      const parsedData: CVAnalysisResult = JSON.parse(storedData);
      
      if ('error' in parsedData) {
        setError((parsedData as any).error);
        setLoading(false);
        return;
      }

      setAnalysisData(parsedData);
      
      const options = transformProgramsToOptions(parsedData);
      setUniversityOptions(options);
      
      if (options.length > 0) {
        setSelectedOption(options[0]);
      }

    } catch (err) {
      console.error('Error loading analysis data:', err);
      setError("Failed to load analysis results.");
    } finally {
      setLoading(false);
    }
  };

  const loadUserFavorites = async () => {
    if (!user) return;
    
    try {
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', user.user_id));
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

  const transformProgramsToOptions = (data: CVAnalysisResult): UniversityOption[] => {
    if (!data.recommended_programs) return [];
    
    return data.recommended_programs.map((program, index) => ({
      id: `${program.university}-${program.country}-${index}`,
      name: program.university,
      country: program.country,
      city: program.city,
      program: program,
      totalCost: program.annual_cost_idr || 0,
      scholarshipAmount: program.scholarship_amount_idr || 0,
      netCost: program.net_cost_idr || 0,
      withinBudget: program.fits_budget === 'yes',
      matchScore: program.match_score || 0,
      reasoning: program.reasoning || '',
      ranking: program.world_ranking || null
    }));
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

  const saveToFavorites = async (option: UniversityOption) => {
  if (!user) {
    alert('Please login to save favorites');
    return;
  }

  try {
    await addDoc(collection(db, 'favorites'), {
      userId: user.user_id,
      universityId: option.id,
      name: option.name || '',
      country: option.country || '',
      city: option.city || '',
      jurusan: option.program?.jurusan || '',
      annual_cost_idr: option.program?.annual_cost_idr || 0,
      scholarship_amount_idr: option.program?.scholarship_amount_idr || 0,
      net_cost_idr: option.program?.net_cost_idr || 0,
      fits_budget: option.program?.fits_budget || 'unknown',
      match_score: option.program?.match_score || 0,
      reasoning: option.program?.reasoning || '',
      world_ranking: option.program?.world_ranking || null,
      admission_requirements: option.program?.admission_requirements || null, 
      totalCost: option.totalCost || 0,
      scholarshipAmount: option.scholarshipAmount || 0,
      netCost: option.netCost || 0,
      withinBudget: option.withinBudget ?? false,
      matchScore: option.matchScore || 0,
      ranking: option.ranking || null,
      createdAt: new Date()
    });
    console.log('Successfully saved to favorites');
  } catch (error) {
    console.error('Error saving to favorites:', error);
    throw error;
  }
};

  const removeFromFavorites = async (universityId: string) => {
    if (!user) return;

    try {
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef, 
        where('userId', '==', user.user_id), 
        where('universityId', '==', universityId)
      );
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      console.log('Successfully removed from favorites');
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

    const option = universityOptions.find(u => u.id === universityId);
    if (!option) return;

    try {
      const newFavorites = new Set(favorites);
      
      if (newFavorites.has(universityId)) {
        await removeFromFavorites(universityId);
        newFavorites.delete(universityId);
      } else {
        await saveToFavorites(option);
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

  const navigateToTimeline = () => {
    router.push('/timeline');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading your university matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!selectedOption || universityOptions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>No university recommendations found in your CV analysis.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex">
        <div className="w-80 border-r min-h-screen">
          <div className="p-6 border-b">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h2 className="text-xl font-bold">Your Matches</h2>
            <p className="text-sm text-muted-foreground mt-1">{universityOptions.length} programs found</p>
          </div>
          
          <div className="p-4 space-y-3">
            {universityOptions.map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedOption?.id === option.id
                    ? 'ring-2 ring-primary shadow-md'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedOption(option)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{option.name}</h3>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getMatchColor(option.matchScore)}`}></div>
                      <span className="text-xs text-muted-foreground">{option.matchScore}/10</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" />
                    {option.city}, {option.country}
                  </p>
                  <p className="text-xs text-blue-600 mb-2">{option.program.jurusan}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-medium">
                      {formatCurrency(option.netCost)}/year
                    </p>
                    {option.ranking && (
                      <span className="text-xs text-primary">#{option.ranking}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold">{selectedOption.name}</h1>
                <p className="text-lg text-muted-foreground flex items-center gap-2 mt-1">
                  <MapPin className="w-5 h-5" />
                  {selectedOption.city}, {selectedOption.country}
                </p>
                <p className="text-blue-600 font-medium mt-1">{selectedOption.program.jurusan}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => toggleFavorite(selectedOption.id)}
                className="flex items-center gap-2"
                disabled={!user}
              >
                <Star 
                  className={`w-4 h-4 ${
                    favorites.has(selectedOption.id) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-muted-foreground'
                  }`} 
                />
                {favorites.has(selectedOption.id) ? 'Favorited' : 'Add to Favorites'}
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 h-12">
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
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Match Score</p>
                          <p className="text-2xl font-bold">{selectedOption.matchScore}/10</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getMatchColor(selectedOption.matchScore)}`}></div>
                      </div>
                      <Progress value={selectedOption.matchScore * 10} className="mt-3" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Budget Status</p>
                          <p className="text-lg font-bold">
                            {selectedOption.withinBudget ? 'Affordable' : 'Scholarship Needed'}
                          </p>
                        </div>
                        <CheckCircle className={`w-6 h-6 ${selectedOption.withinBudget ? 'text-green-500' : 'text-muted-foreground'}`} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">World Ranking</p>
                          <p className="text-2xl font-bold">
                            #{selectedOption.ranking || 'N/A'}
                          </p>
                        </div>
                        <TrendingUp className="w-6 h-6 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Program Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-lg">{selectedOption.program.jurusan}</h4>
                        <p className="text-muted-foreground mt-1">{selectedOption.reasoning}</p>
                      </div>
                      
                      {analysisData?.academic_analysis && (
                        <div className="border-t pt-4">
                          <h5 className="font-medium text-sm text-muted-foreground mb-2">Academic Analysis</h5>
                          <p className="text-sm">{analysisData.academic_analysis}</p>
                        </div>
                      )}

                      {analysisData?.skills_assessment && (
                        <div className="border-t pt-4">
                          <h5 className="font-medium text-sm text-muted-foreground mb-2">Skills Assessment</h5>
                          <p className="text-sm">{analysisData.skills_assessment}</p>
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Annual Cost</p>
                          <p className="text-lg font-semibold">{formatCurrency(selectedOption.totalCost)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Match Score</p>
                          <p className="text-lg font-semibold">{selectedOption.program.match_score}/10</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="budget" className="space-y-6">
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
                          <span className="text-muted-foreground">Annual Tuition</span>
                          <span className="font-semibold">{formatCurrency(selectedOption.totalCost)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Scholarship Available</span>
                          <span className="font-semibold text-green-600">-{formatCurrency(selectedOption.scholarshipAmount)}</span>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Net Annual Cost</span>
                            <span className="text-xl font-bold">{formatCurrency(selectedOption.netCost)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Budget Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysisData?.budget_breakdown && (
                        <div className="space-y-3">
                          {analysisData.budget_breakdown.average_tuition_idr && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Average Tuition</span>
                              <span className="font-medium">{formatCurrency(analysisData.budget_breakdown.average_tuition_idr)}</span>
                            </div>
                          )}
                          {analysisData.budget_breakdown.average_living_monthly_idr && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Monthly Living</span>
                              <span className="font-medium">{formatCurrency(analysisData.budget_breakdown.average_living_monthly_idr)}</span>
                            </div>
                          )}
                          {analysisData.budget_breakdown.total_annual_cost_idr && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Total Annual</span>
                              <span className="font-medium">{formatCurrency(analysisData.budget_breakdown.total_annual_cost_idr)}</span>
                            </div>
                          )}
                          {analysisData.budget_breakdown.minimum_self_funding_idr && (
                            <div className="border-t pt-3">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Minimum Self Funding</span>
                                <span className="text-xl font-bold">{formatCurrency(analysisData.budget_breakdown.minimum_self_funding_idr)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="scholarships" className="space-y-6">
                <div className="grid gap-4">
                  {analysisData?.scholarship_priorities?.map((scholarship, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">{scholarship.name}</h4>
                            <p className="text-muted-foreground text-sm mt-1">Coverage: {scholarship.coverage_percentage}%</p>
                          </div>
                          <Badge variant={
                            scholarship.success_probability === 'high' ? 'default' :
                            scholarship.success_probability === 'medium' ? 'secondary' : 'outline'
                          }>
                            {scholarship.success_probability} chance
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Amount</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(scholarship.coverage_idr)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Deadline</p>
                            <p className="text-lg font-semibold text-destructive">{scholarship.deadline}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Requirements</p>
                          <p className="text-sm">{scholarship.requirements}</p>
                          {scholarship.documents_needed && (
                            <>
                              <p className="text-sm font-medium text-muted-foreground mt-2">Documents Needed</p>
                              <p className="text-sm">{scholarship.documents_needed}</p>
                            </>
                          )}
                        </div>
                        
                        <Button className="w-full mt-4" onClick={() => window.open(scholarship.application_url, '_blank')}>
                          Apply Now
                        </Button>
                      </CardContent>
                    </Card>
                  )) || (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">No scholarship information available</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="improvement" className="space-y-6">
                <div className="grid gap-4">
                  {analysisData?.improvement_areas?.map((area, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">{area.area}</h4>
                            <p className="text-muted-foreground text-sm mt-1">{area.timeline}</p>
                          </div>
                          <Badge variant="outline">{formatCurrency(area.estimated_cost_idr)}</Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Current Level</p>
                            <p className="text-sm">{area.current_level}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Target Level</p>
                            <p className="text-sm">{area.target_level}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Action Plan</p>
                            <p className="text-sm">{area.action_plan}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) || (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">No improvement recommendations available</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="lifestyle" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cloud className="w-5 h-5" />
                        Climate & Environment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysisData?.climate_security ? (
                        <div className="space-y-4">
                          {analysisData.climate_security.climate_type && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Climate</p>
                              <p className="text-sm">{analysisData.climate_security.climate_type}</p>
                            </div>
                          )}
                          {analysisData.climate_security.temperature_range && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Temperature Range</p>
                              <p className="text-sm">{analysisData.climate_security.temperature_range}</p>
                            </div>
                          )}
                          {analysisData.climate_security.safety_score && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Safety Score</p>
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-green-600" />
                                <span className="text-lg font-semibold">{analysisData.climate_security.safety_score}/10</span>
                              </div>
                            </div>
                          )}
                          {analysisData.climate_security.clothing_budget_idr && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Clothing Budget</p>
                              <p className="text-lg font-semibold">{formatCurrency(analysisData.climate_security.clothing_budget_idr)}</p>
                            </div>
                          )}
                          {analysisData.climate_security.adaptation_tips && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Adaptation Tips</p>
                              <p className="text-sm">{analysisData.climate_security.adaptation_tips}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No climate information available</p>
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
                      {analysisData?.religious_facilities ? (
                        <div className="space-y-4">
                          {analysisData.religious_facilities.islam && (
                            <div className="space-y-3">
                              <h6 className="font-medium">Islamic Facilities</h6>
                              {analysisData.religious_facilities.islam.availability && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Availability</p>
                                  <p className="text-sm">{analysisData.religious_facilities.islam.availability}</p>
                                </div>
                              )}
                              {analysisData.religious_facilities.islam.halal_food && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Halal Food</p>
                                  <p className="text-sm">{analysisData.religious_facilities.islam.halal_food}</p>
                                </div>
                              )}
                              {analysisData.religious_facilities.islam.prayer_rooms && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Prayer Facilities</p>
                                  <p className="text-sm">{analysisData.religious_facilities.islam.prayer_rooms}</p>
                                </div>
                              )}
                              {analysisData.religious_facilities.islam.community && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Community</p>
                                  <p className="text-sm">{analysisData.religious_facilities.islam.community}</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {analysisData.religious_facilities.christian && (
                            <div className="space-y-3 border-t pt-4">
                              <h6 className="font-medium">Christian Facilities</h6>
                              {analysisData.religious_facilities.christian.availability && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Availability</p>
                                  <p className="text-sm">{analysisData.religious_facilities.christian.availability}</p>
                                </div>
                              )}
                              {analysisData.religious_facilities.christian.church_distance && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Church Distance</p>
                                  <p className="text-sm">{analysisData.religious_facilities.christian.church_distance}</p>
                                </div>
                              )}
                              {analysisData.religious_facilities.christian.denominations && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Denominations</p>
                                  <p className="text-sm">{analysisData.religious_facilities.christian.denominations}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No religious facility information available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {favorites.size > 0 && user && (
        <div className="fixed bottom-6 right-6">
          <Button 
            onClick={navigateToTimeline}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 text-lg"
          >
             Next
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
};