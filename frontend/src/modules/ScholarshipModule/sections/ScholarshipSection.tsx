"use client";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDays, DollarSign, ExternalLink, GraduationCap, MapPin, Users } from 'lucide-react';
import { SCHOLARSHIPS } from '../constant';
import { Scholarship } from '../interface';

export const ScholarshipSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  const filteredScholarships = useMemo(() => {
    return SCHOLARSHIPS.filter((scholarship) => {
      const matchesSearch = scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scholarship.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || scholarship.category === selectedCategory;
      const matchesLevel = selectedLevel === 'All' || scholarship.level === selectedLevel || scholarship.level === 'All';
      
      return matchesSearch && matchesCategory && matchesLevel && scholarship.isActive;
    });
  }, [searchTerm, selectedCategory, selectedLevel]);

  const getCategoryColor = (category: Scholarship['category']) => {
    const colors = {
      Academic: 'bg-blue-100 text-blue-800',
      'Need-Based': 'bg-green-100 text-green-800',
      Merit: 'bg-purple-100 text-purple-800',
      Sport: 'bg-orange-100 text-orange-800',
      Arts: 'bg-pink-100 text-pink-800',
      STEM: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category];
  };

  const formatDeadline = (deadline: string) => {
    return new Date(deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isDeadlineSoon = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Scholarship Opportunities</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover financial aid opportunities to support your educational journey. 
          Filter by category, level, and search to find the perfect scholarships for you.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Find Your Perfect Scholarship</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium text-gray-700">
              Search Scholarships
            </label>
            <Input
              id="search"
              placeholder="Search by title, provider, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Found <span className="font-semibold text-gray-900">{filteredScholarships.length}</span> scholarships
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredScholarships.map((scholarship) => (
          <Card key={scholarship.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                  {scholarship.title}
                </CardTitle>
                {isDeadlineSoon(scholarship.deadline) && (
                  <Badge variant="destructive" className="text-xs">
                    Deadline Soon
                  </Badge>
                )}
              </div>
              <CardDescription className="text-gray-600">
                {scholarship.provider}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {scholarship.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">{scholarship.amount}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarDays className="h-4 w-4" />
                  <span>{formatDeadline(scholarship.deadline)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <GraduationCap className="h-4 w-4" />
                  <span>{scholarship.level}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{scholarship.country}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(scholarship.category)}>
                  {scholarship.category}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Eligibility Requirements
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {scholarship.eligibility.slice(0, 3).map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                    {scholarship.eligibility.length > 3 && (
                      <li className="text-gray-500 italic">
                        +{scholarship.eligibility.length - 3} more requirements
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-4">
              <Button 
                className="w-full" 
                onClick={() => window.open(scholarship.applicationLink, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredScholarships.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No scholarships found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters to find more opportunities.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedLevel('All');
            }}
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};