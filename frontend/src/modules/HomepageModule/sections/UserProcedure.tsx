'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const featureSteps = [
  {
    title: "Scholarship & Funding Matcher",
    description: "Upload your CV, and let GlobalMatch AI find the best countries, programs, and opportunities that fit you.",
    bgColor: "bg-blue-500",
    illustration: "/GENERATE_QR_ILLUST.png"
  },
  {
    title: "Dreamtracker",
    description: "Step-by-Step Preparation Roadmap, helps you set, track, and complete every milestone,  from start to finish.",
    bgColor: "bg-green-500",
    illustration: "/SCAN_PAY_ILLUST.png"
  },
  {
    title: "Scholarship Hub",
    description: "Say goodbye to 50 open tabs. We bring together scholarships just for you. Filter, save, and apply without the overwhelm.",
    bgColor: "bg-purple-500",
    illustration: "/SETTLEMENT_ILLUST.png"
  },
  {
    title: "Bonbon AI",
    description: "From visas to universities, Bonbon is your 24/7 guide to the study abroad universe, tailored to your goals.",
    bgColor: "bg-orange-500",
    illustration: "/CASH_OUT_ILLUST.png"
  }
];

export const ProcedureSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prevStep) => (prevStep + 1) % featureSteps.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
  };

  return (
    <section
      id="procedure"
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FFF3E6 0%, #FFFFFF 100%)" }}
    >
      <div className="relative z-10 max-w-7xl mx-auto w-full py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            See <span className="text-orange-500">Boundless</span> in Action
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Discover how easy it is to integrate crypto payments into your business workflow.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Steps List */}
          <div className="space-y-6">
            {featureSteps.map((step, index) => (
              <div
                key={step.title}
                onClick={() => handleStepClick(index)}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out ${
                  activeStep === index
                    ? 'bg-white shadow-xl ring-2 ring-orange-500/50'
                    : 'bg-gray-50 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${step.bgColor}`}>
                    {activeStep === index ? index + 1 : index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Illustration */}
          <div className="flex items-center justify-center min-h-[300px] lg:min-h-[450px] bg-gray-50 rounded-3xl p-8 backdrop-blur-md shadow-lg">
            <Image
              key={activeStep}
              src={featureSteps[activeStep].illustration}
              alt={featureSteps[activeStep].title}
              width={400}
              height={400}
              className="w-full max-w-md rounded-2xl transition-opacity duration-500 ease-in-out"
            />
          </div>
        </div>
      </div>
    </section>
  );
};