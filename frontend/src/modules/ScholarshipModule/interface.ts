export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  description: string;
  requirements: string[];
  eligibility: string[];
  applicationLink: string;
  category: 'Academic' | 'Need-Based' | 'Merit' | 'Sport' | 'Arts' | 'STEM';
  level: 'Undergraduate' | 'Graduate' | 'Postgraduate' | 'All';
  country: string;
  isActive: boolean;
}