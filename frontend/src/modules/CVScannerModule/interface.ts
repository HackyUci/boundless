export interface FavoriteUniversity {
  id: string;
  name: string;
  country: string;
  city: string;
  jurusan: string;
  annual_cost_idr?: number;
  scholarship_amount_idr?: number;
  net_cost_idr?: number;
  fits_budget?: string;
  match_score?: number;
  reasoning?: string;
  world_ranking?: number;
  admission_requirements?: string;
  netCost: number;
  matchScore: number;
  ranking?: number;
  createdAt: any;
}

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  deadline: string;
  universityName: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  type: 'application' | 'test' | 'document' | 'scholarship' | 'visa';
  estimatedCost?: number;
  phase: number;
}

export interface TimelinePhase {
  phase: number;
  title: string;
  description: string;
  duration: string;
  steps: TimelineStep[];
}

export interface Program {
  university: string;
  jurusan: string;
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

export interface Scholarship {
  name: string;
  coverage_idr: number;
  coverage_percentage: number;
  deadline: string;
  application_url: string;
  success_probability: string;
  requirements: string;
  documents_needed?: string;
}

export interface PrepStep {
  action: string;
  deadline: string;
  cost_idr: number;
  priority: string;
}

export interface ImprovementArea {
  area: string;
  current_level: string;
  target_level: string;
  action_plan: string;
  timeline: string;
  estimated_cost_idr: number;
}

export interface CVAnalysisResult {
  academic_analysis?: string;
  skills_assessment?: string;
  recommended_programs?: Program[];
  scholarship_priorities?: Scholarship[];
  preparation_steps?: PrepStep[];
  improvement_areas?: ImprovementArea[];
  budget_breakdown?: {
    average_tuition_idr?: number;
    average_living_monthly_idr?: number;
    total_annual_cost_idr?: number;
    best_scholarship_coverage_idr?: number;
    minimum_self_funding_idr?: number;
  };
  climate_security?: {
    climate_type?: string;
    temperature_range?: string;
    safety_score?: number;
    clothing_budget_idr?: number;
    adaptation_tips?: string;
  };
  religious_facilities?: {
    islam?: {
      availability?: string;
      mosque_distance?: string;
      halal_food?: string;
      prayer_rooms?: string;
      community?: string;
    };
    christian?: {
      availability?: string;
      church_distance?: string;
      denominations?: string;
    };
  };
}

export interface UniversityOption {
  id: string;
  name: string;
  country: string;
  city: string;
  program: Program;
  totalCost: number;
  scholarshipAmount: number;
  netCost: number;
  withinBudget: boolean;
  matchScore: number;
  reasoning: string;
  ranking: number | null;
}