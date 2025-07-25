"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const AnimatedTooltip = () => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsActive(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => setIsActive(false), 300); // Delay untuk transisi animasi
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50"
      ref={tooltipRef}
    >
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="absolute pointer-events-auto cursor-move select-none"
              style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px`,
                transform: 'translate(-50%, -50%)',
                transition: isDragging ? 'none' : 'transform 0.2s ease'
              }}
              onMouseDown={handleMouseDown}
              onMouseEnter={() => !isDragging && setIsActive(true)}
              onMouseLeave={() => !isDragging && setIsActive(false)}
            >
              <div className="relative w-16 h-16">
                <Image
                  src="/BONBON_HIHI.svg"
                  alt="Bonbon normal state"
                  width={64}
                  height={64}
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isActive ? 'opacity-0' : 'opacity-100'
                  }`}
                  priority
                />
                
                <Image
                  src="/BONBON_MEREM.svg"
                  alt="Bonbon animated state"
                  width={64}
                  height={64}
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                  priority
                />
              </div>
            </div>
          </TooltipTrigger>
          
          <TooltipContent 
            side="top" 
            className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg max-w-xs"
          >
            <p>Hello, I'm Bonbon. I'm here to help</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default AnimatedTooltip;