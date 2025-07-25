import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Target, 
  Star, 
  MapPin, 
  ArrowLeft,
  BookOpen,
  FileText,
  Award,
  Plane,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { FavoriteUniversity, TimelinePhase } from '../interface';


export const TimelineSection = () => {
  const { user } = useAuth(); 
  const [favoriteUniversities, setFavoriteUniversities] = useState<FavoriteUniversity[]>([]);
  const [timelinePhases, setTimelinePhases] = useState<TimelinePhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [currentPhase, setCurrentPhase] = useState(0);
  const router = useRouter();

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
        where('userId', '==', user?.user_id) 
      );
      const querySnapshot = await getDocs(q);
      
      const favorites: FavoriteUniversity[] = [];
      querySnapshot.forEach((doc) => {
        favorites.push({ id: doc.id, ...doc.data() } as FavoriteUniversity);
      });
      
      setFavoriteUniversities(favorites);
      const phases = generateTimelinePhases(favorites);
      setTimelinePhases(phases);
      
      await loadProgressFromFirebase();
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgressFromFirebase = async () => {
    try {
      const progressRef = collection(db, 'timeline_progress');
      const q = query(progressRef, where('userId', '==', user?.user_id)); 
      const querySnapshot = await getDocs(q);
      
      const completedSet = new Set<string>();
      querySnapshot.forEach((doc) => {
        if (doc.data().completed) {
          completedSet.add(doc.data().stepId);
        }
      });
      
      setCompletedSteps(completedSet);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const generateTimelinePhases = (universities: FavoriteUniversity[]): TimelinePhase[] => {
    const phases: TimelinePhase[] = [
      {
        phase: 1,
        title: "Preparation Phase",
        description: "Documents and language requirements",
        duration: "2-3 months",
        steps: []
      },
      {
        phase: 2,
        title: "Application Phase", 
        description: "Submit applications and scholarships",
        duration: "1-2 months",
        steps: []
      },
      {
        phase: 3,
        title: "Decision Phase",
        description: "Wait for results and make decisions",
        duration: "2-4 months", 
        steps: []
      },
      {
        phase: 4,
        title: "Pre-Departure",
        description: "Visa processing and preparation",
        duration: "2-3 months",
        steps: []
      }
    ];

    
    const analysisData = localStorage.getItem('cvAnalysisResult');
    if (!analysisData) {
      console.log('No analysis data found in localStorage');
      return phases;
    }

    try {
      const parsedData = JSON.parse(analysisData);
      
      if (parsedData.preparation_steps) {
        parsedData.preparation_steps.forEach((step: any, index: number) => {
          const stepId = `prep-${index}-${step.action.replace(/\s+/g, '-').toLowerCase()}`;
          
          let targetPhase = 1;
          let stepType: 'application' | 'test' | 'document' | 'scholarship' | 'visa' = 'document';
          
          if (step.action.toLowerCase().includes('ielts') || step.action.toLowerCase().includes('toefl') || step.action.toLowerCase().includes('test')) {
            targetPhase = 1;
            stepType = 'test';
          } else if (step.action.toLowerCase().includes('transcript') || step.action.toLowerCase().includes('document')) {
            targetPhase = 1;
            stepType = 'document';
          } else if (step.action.toLowerCase().includes('scholarship') || step.action.toLowerCase().includes('essay')) {
            targetPhase = 2;
            stepType = 'scholarship';
          } else if (step.action.toLowerCase().includes('application') || step.action.toLowerCase().includes('apply')) {
            targetPhase = 2;
            stepType = 'application';
          } else if (step.action.toLowerCase().includes('visa')) {
            targetPhase = 4;
            stepType = 'visa';
          }

          const deadlineDate = new Date();
          if (step.deadline) {
            if (step.deadline.toLowerCase().includes('month')) {
              const months = parseInt(step.deadline.match(/\d+/)?.[0] || '3');
              deadlineDate.setMonth(deadlineDate.getMonth() + months);
            } else if (step.deadline.toLowerCase().includes('week')) {
              const weeks = parseInt(step.deadline.match(/\d+/)?.[0] || '6');
              deadlineDate.setDate(deadlineDate.getDate() + (weeks * 7));
            } else {
              deadlineDate.setMonth(deadlineDate.getMonth() + 3);
            }
          }

          phases[targetPhase - 1].steps.push({
            id: stepId,
            title: step.action,
            description: `${step.action} - ${step.deadline}`,
            deadline: deadlineDate.toISOString().split('T')[0],
            universityName: 'All Applications',
            priority: step.priority || 'medium',
            completed: false,
            type: stepType,
            estimatedCost: step.cost_idr || 0,
            phase: targetPhase
          });
        });
      }

      if (parsedData.scholarship_priorities) {
        parsedData.scholarship_priorities.forEach((scholarship: any, index: number) => {
          const stepId = `scholarship-${index}-${scholarship.name.replace(/\s+/g, '-').toLowerCase()}`;
          
          let deadlineDate = new Date();
          if (scholarship.deadline) {
            try {
              deadlineDate = new Date(scholarship.deadline);
            } catch {
              deadlineDate.setMonth(deadlineDate.getMonth() + 6); 
            }
          }

          phases[1].steps.push({
            id: stepId,
            title: `Apply for ${scholarship.name}`,
            description: `Submit application for ${scholarship.name} - ${scholarship.coverage_percentage}% coverage`,
            deadline: deadlineDate.toISOString().split('T')[0],
            universityName: 'Scholarship Application',
            priority: scholarship.success_probability === 'high' ? 'high' : scholarship.success_probability === 'medium' ? 'medium' : 'low',
            completed: false,
            type: 'scholarship',
            estimatedCost: 0, 
            phase: 2
          });
        });
      }

      universities.forEach((university) => {
        const applicationDeadline = new Date();
        applicationDeadline.setMonth(applicationDeadline.getMonth() + 4); 

        phases[1].steps.push({
          id: `app-${university.id}`,
          title: `Submit Application to ${university.name}`,
          description: `Complete and submit application for ${university.jurusan}`, 
          deadline: applicationDeadline.toISOString().split('T')[0],
          universityName: university.name,
          priority: 'high',
          completed: false,
          type: 'application',
          estimatedCost: 1000000, 
          phase: 2
        });

        const decisionDeadline = new Date();
        decisionDeadline.setMonth(decisionDeadline.getMonth() + 6); 

        phases[2].steps.push({
          id: `decision-${university.id}`,
          title: `Admission Decision from ${university.name}`,
          description: `Wait for admission decision and respond if accepted`,
          deadline: decisionDeadline.toISOString().split('T')[0],
          universityName: university.name,
          priority: 'medium',
          completed: false,
          type: 'application',
          phase: 3
        });

        const visaDeadline = new Date();
        visaDeadline.setMonth(visaDeadline.getMonth() + 8); 

        phases[3].steps.push({
          id: `visa-${university.id}`,
          title: `Apply for Student Visa - ${university.country}`,
          description: `Submit student visa application for ${university.country}`,
          deadline: visaDeadline.toISOString().split('T')[0],
          universityName: university.name,
          priority: 'high',
          completed: false,
          type: 'visa',
          estimatedCost: 5000000, 
          phase: 4
        });
      });
    } catch (error) {
      console.error('Error parsing analysis data:', error);
    }

    return phases;
  };

  const toggleStepCompletion = async (stepId: string) => {
    try {
      const newCompletedSteps = new Set(completedSteps);
      const isCompleting = !newCompletedSteps.has(stepId);
      if (isCompleting) {
        newCompletedSteps.add(stepId);
      } else {
        newCompletedSteps.delete(stepId);
      }
      setCompletedSteps(newCompletedSteps);
      await addDoc(collection(db, 'timeline_progress'), {
        userId: user?.user_id, 
        stepId: stepId,
        completed: isCompleting,
        completedAt: new Date(),
        updatedAt: new Date()
      });
      
      setTimelinePhases(prev => 
        prev.map(phase => ({
          ...phase,
          steps: phase.steps.map(step => 
            step.id === stepId 
              ? { ...step, completed: isCompleting }
              : step
          )
        }))
      );

      updateCurrentPhase();
    } catch (error) {
      console.error('Error updating step completion:', error);
    }
  };

  const updateCurrentPhase = () => {
    for (let i = 0; i < timelinePhases.length; i++) {
      const phase = timelinePhases[i];
      const completedInPhase = phase.steps.filter(step => completedSteps.has(step.id)).length;
      const totalInPhase = phase.steps.length;
      
      if (completedInPhase < totalInPhase) {
        setCurrentPhase(i);
        break;
      }
      if (i === timelinePhases.length - 1) {
        setCurrentPhase(i);
      }
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'application': return <Target className="w-4 h-4" />;
      case 'test': return <BookOpen className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'scholarship': return <Award className="w-4 h-4" />;
      case 'visa': return <Plane className="w-4 h-4" />;
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
      month: 'short',
      year: 'numeric'
    });
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const calculatePhaseProgress = (phase: TimelinePhase) => {
    const completed = phase.steps.filter(step => completedSteps.has(step.id)).length;
    return phase.steps.length > 0 ? (completed / phase.steps.length) * 100 : 0;
  };

  const totalProgress = () => {
    const allSteps = timelinePhases.flatMap(phase => phase.steps);
    const completedCount = allSteps.filter(step => completedSteps.has(step.id)).length;
    return allSteps.length > 0 ? (completedCount / allSteps.length) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading your timeline...</p>
        </div>
      </div>
    );
  }

  if (favoriteUniversities.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Application Timeline</h1>
              <p className="text-muted-foreground">Track your university application progress</p>
            </div>
          </div>
          
          <Card>
            <CardContent className="text-center py-12">
              <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Favorite Universities</h3>
              <p className="text-muted-foreground mb-6">Add universities to favorites to create your personalized timeline</p>
              <Button onClick={() => router.push('/result')}>
                Browse Universities
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(totalProgress())}%</span>
              </div>
              <Progress value={totalProgress()} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{timelinePhases.flatMap(p => p.steps).filter(s => completedSteps.has(s.id)).length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{timelinePhases.flatMap(p => p.steps).filter(s => !completedSteps.has(s.id) && !isOverdue(s.deadline)).length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{timelinePhases.flatMap(p => p.steps).filter(s => !completedSteps.has(s.id) && isOverdue(s.deadline)).length}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{favoriteUniversities.length}</p>
                <p className="text-sm text-muted-foreground">Universities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Application Phases</h2>
            <div className="flex space-x-2">
              {timelinePhases.map((phase, index) => (
                <div
                  key={phase.phase}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    calculatePhaseProgress(phase) === 100 
                      ? 'bg-primary' 
                      : index === currentPhase 
                        ? 'bg-primary/60' 
                        : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-border">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${totalProgress()}%` }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {timelinePhases.map((phase, index) => (
                <Card key={phase.phase} className={`transition-all ${index === currentPhase ? 'ring-1 ring-primary' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                        calculatePhaseProgress(phase) === 100 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : index === currentPhase 
                            ? 'border-primary text-primary' 
                            : 'border-muted-foreground text-muted-foreground'
                      }`}>
                        {calculatePhaseProgress(phase) === 100 ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          phase.phase
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(calculatePhaseProgress(phase))}%
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{phase.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{phase.description}</p>
                    <p className="text-xs text-muted-foreground">{phase.duration}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Progress value={calculatePhaseProgress(phase)} className="mb-3 h-1" />
                    <div className="space-y-2">
                      {phase.steps.slice(0, 3).map((step) => (
                        <div
                          key={step.id}
                          className={`p-2 rounded border text-xs transition-all cursor-pointer hover:bg-muted/50 ${
                            completedSteps.has(step.id)
                              ? 'bg-muted border-border' 
                              : isOverdue(step.deadline) 
                                ? 'border-destructive/50 bg-destructive/5' 
                                : 'border-border'
                          }`}
                          onClick={() => toggleStepCompletion(step.id)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                                completedSteps.has(step.id)
                                  ? 'bg-primary border-primary' 
                                  : 'border-muted-foreground'
                              }`}>
                                {completedSteps.has(step.id) && <CheckCircle2 className="w-2 h-2 text-primary-foreground" />}
                              </div>
                              <span className={completedSteps.has(step.id) ? 'line-through text-muted-foreground' : ''}>
                                {step.title}
                              </span>
                            </div>
                            {getTypeIcon(step.type)}
                          </div>
                          <p className="text-xs text-muted-foreground ml-5">
                            {formatDate(step.deadline)}
                          </p>
                        </div>
                      ))}
                      {phase.steps.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{phase.steps.length - 3} more steps
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {timelinePhases.map((phase) => (
                <div key={phase.phase}>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                      calculatePhaseProgress(phase) === 100 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {phase.phase}
                    </span>
                    {phase.title}
                  </h3>
                  <div className="space-y-2 ml-8">
                    {phase.steps.map((step) => (
                      <div
                        key={step.id}
                        className={`p-3 rounded border transition-all cursor-pointer hover:bg-muted/50 ${
                          completedSteps.has(step.id)
                            ? 'bg-muted border-border' 
                            : isOverdue(step.deadline) 
                              ? 'border-destructive/50 bg-destructive/5' 
                              : 'border-border'
                        }`}
                        onClick={() => toggleStepCompletion(step.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                              completedSteps.has(step.id)
                                ? 'bg-primary border-primary' 
                                : 'border-muted-foreground'
                            }`}>
                              {completedSteps.has(step.id) && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-medium ${completedSteps.has(step.id) ? 'line-through text-muted-foreground' : ''}`}>
                                {step.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(step.deadline)}
                                </span>
                                <span>For: {step.universityName}</span>
                                {step.estimatedCost && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {formatCurrency(step.estimatedCost)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityBadgeVariant(step.priority)} className="text-xs">
                              {step.priority}
                            </Badge>
                            {getTypeIcon(step.type)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {phase.phase < timelinePhases.length && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Your Target Universities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteUniversities.map((university) => (
                <Card key={university.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold">{university.name}</h4>
                    <Badge variant="outline">{university.matchScore}/10</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" />
                    {university.city}, {university.country}
                  </p>
                  <p className="text-sm text-blue-600 mb-2">{university.jurusan}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">
                      {formatCurrency(university.netCost)}/year
                    </span>
                    {university.ranking && (
                      <span className="text-muted-foreground">#{university.ranking}</span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Program: {university.jurusan}
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};