import { Scholarship } from './interface';

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: '1',
    title: 'Excellence Academic Scholarship',
    provider: 'National Education Foundation',
    amount: '$5,000 - $10,000',
    deadline: '2025-03-15',
    description: 'Merit-based scholarship for outstanding academic performance in STEM fields.',
    requirements: [
      'Minimum GPA of 3.7',
      'Complete application form',
      'Two letters of recommendation',
      'Personal statement (500 words)',
      'Academic transcripts'
    ],
    eligibility: [
      'Enrolled in STEM program',
      'US citizen or permanent resident',
      'Full-time student status',
      'Undergraduate or graduate level'
    ],
    applicationLink: 'https://example.com/apply/excellence',
    category: 'Academic',
    level: 'All',
    country: 'United States',
    isActive: true
  },
  {
    id: '2',
    title: 'Future Leaders Scholarship',
    provider: 'Global Youth Foundation',
    amount: '$15,000',
    deadline: '2025-04-30',
    description: 'Supporting emerging leaders who demonstrate exceptional potential in community service and leadership.',
    requirements: [
      'Leadership experience documentation',
      'Community service record (100+ hours)',
      'Essay on future goals (750 words)',
      'Three professional references',
      'Video submission (3 minutes)'
    ],
    eligibility: [
      'Age 18-25',
      'Demonstrated leadership experience',
      'Community involvement record',
      'Any field of study'
    ],
    applicationLink: 'https://example.com/apply/future-leaders',
    category: 'Merit',
    level: 'Undergraduate',
    country: 'International',
    isActive: true
  },
  {
    id: '3',
    title: 'Need-Based Support Grant',
    provider: 'Educational Access Initiative',
    amount: '$3,000 - $7,500',
    deadline: '2025-02-28',
    description: 'Financial assistance for students from low-income families to pursue higher education.',
    requirements: [
      'FAFSA completion',
      'Family income documentation',
      'Academic transcripts',
      'Personal financial statement',
      'Recommendation letter from counselor'
    ],
    eligibility: [
      'Family income below $50,000',
      'First-generation college student (preferred)',
      'Minimum GPA of 2.5',
      'US resident'
    ],
    applicationLink: 'https://example.com/apply/need-based',
    category: 'Need-Based',
    level: 'Undergraduate',
    country: 'United States',
    isActive: true
  },
  {
    id: '4',
    title: 'Creative Arts Excellence Award',
    provider: 'Arts & Culture Foundation',
    amount: '$8,000',
    deadline: '2025-05-15',
    description: 'Recognition and financial support for talented students in visual arts, music, theater, or creative writing.',
    requirements: [
      'Portfolio submission (10-15 pieces)',
      'Artist statement (400 words)',
      'Academic transcripts',
      'Two recommendation letters from art instructors',
      'Performance video (for performing arts)'
    ],
    eligibility: [
      'Enrolled in arts program',
      'Minimum GPA of 3.0',
      'Demonstrated artistic talent',
      'Any level of study'
    ],
    applicationLink: 'https://example.com/apply/creative-arts',
    category: 'Arts',
    level: 'All',
    country: 'United States',
    isActive: true
  },
  {
    id: '5',
    title: 'Athletic Achievement Scholarship',
    provider: 'Sports Excellence Foundation',
    amount: '$12,000',
    deadline: '2025-06-01',
    description: 'Supporting student-athletes who excel both in sports and academics.',
    requirements: [
      'Athletic performance records',
      'Coach recommendation letter',
      'Academic transcripts (min 3.2 GPA)',
      'Sports highlight video',
      'Personal statement on balancing sports and academics'
    ],
    eligibility: [
      'Varsity team participation',
      'Minimum GPA of 3.2',
      'Active athlete status',
      'High school senior or college student'
    ],
    applicationLink: 'https://example.com/apply/athletic',
    category: 'Sport',
    level: 'Undergraduate',
    country: 'United States',
    isActive: false
  }
];

export const SCHOLARSHIP_CATEGORIES = [
  'All',
  'Academic',
  'Need-Based', 
  'Merit',
  'Sport',
  'Arts',
  'STEM'
] as const;

export const SCHOLARSHIP_LEVELS = [
  'All',
  'Undergraduate',
  'Graduate', 
  'Postgraduate'
] as const;