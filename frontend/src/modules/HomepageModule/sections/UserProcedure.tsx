'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const featureSteps = [
  {
    title: "Scholarship & Funding Matcher",
    description: "Upload your CV, and let GlobalMatch AI find the best countries, programs, and opportunities that fit you.",
    bgColor: "bg-blue-600",
    accentColor: "border-blue-500",
    illustration: "/SCHOLARSHIP_MATCHER.jpg"
  },
  {
    title: "Dreamtracker",
    description: "Step-by-Step Preparation Roadmap, helps you set, track, and complete every milestone, from start to finish.",
    bgColor: "bg-emerald-600",
    accentColor: "border-emerald-500",
    illustration: "/DREAMTRACKER.jpg"
  },
  {
    title: "Scholarship Hub",
    description: "Say goodbye to 50 open tabs. We bring together scholarships just for you. Filter, save, and apply without the overwhelm.",
    bgColor: "bg-violet-600",
    accentColor: "border-violet-500",
    illustration: "/SCHOLARSHIP_HUB.jpg"
  },
  {
    title: "Bonbon AI",
    description: "From visas to universities, Bonbon is your 24/7 guide to the study abroad universe, tailored to your goals.",
    bgColor: "bg-orange-600",
    accentColor: "border-orange-500",
    illustration: "/BONBON_AI.jpg"
  }
];

export const ProcedureSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prevStep) => (prevStep + 1) % featureSteps.length);
      setProgress(0);
    }, 5000);

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 100);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, []);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setProgress(0);
  };

  return (
    <section
      id="procedure"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-sm">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Platform Features
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            See <span className="text-orange-500">Boundless</span> in Action
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience how our AI-powered platform transforms your study abroad journey with intelligent matching and personalized guidance
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            {featureSteps.map((step, index) => (
              <div
                key={step.title}
                onClick={() => handleStepClick(index)}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ease-out border ${
                  activeStep === index
                    ? `bg-white shadow-xl ${step.accentColor} border-2`
                    : 'bg-white border-gray-200 hover:shadow-lg hover:border-gray-300'
                }`}
              >
                {activeStep === index && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 rounded-t-2xl overflow-hidden">
                    <div 
                      className={`h-full ${step.bgColor} transition-all duration-100 ease-out`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`${step.bgColor} text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm transition-transform duration-300 ${
                    activeStep === index ? 'scale-110' : ''
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {featureSteps[activeStep].title}
                </div>
              </div>
              
              <div className="relative overflow-hidden rounded-xl bg-gray-100">
                <Image
                  key={activeStep}
                  src={featureSteps[activeStep].illustration}
                  alt={featureSteps[activeStep].title}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-full h-auto rounded-xl transition-opacity duration-500 ease-in-out"
                />
              </div>
              
              <div className="flex justify-center mt-6 gap-3">
                {featureSteps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => handleStepClick(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeStep === index 
                        ? `${step.bgColor} scale-125 shadow-sm` 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};