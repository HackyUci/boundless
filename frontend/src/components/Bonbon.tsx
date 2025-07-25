"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const AnimatedTooltip = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isBouncing, setIsBouncing] = useState(true);
  const dragStart = useRef({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const bounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const updatePosition = () => {
      setPosition({
        x: window.innerWidth - 80,
        y: window.innerHeight - 80
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsActive(true);
    setIsBouncing(false);
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
    setTimeout(() => {
      setIsActive(false);
      if (bounceTimeoutRef.current) {
        clearTimeout(bounceTimeoutRef.current);
      }
      bounceTimeoutRef.current = setTimeout(() => {
        setIsBouncing(true);
      }, 2000);
    }, 300);
  };

  const handleMouseEnter = () => {
    if (!isDragging) {
      setIsActive(true);
      setIsBouncing(false);
      if (bounceTimeoutRef.current) {
        clearTimeout(bounceTimeoutRef.current);
      }
    }
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setIsActive(false);
      if (bounceTimeoutRef.current) {
        clearTimeout(bounceTimeoutRef.current);
      }
      bounceTimeoutRef.current = setTimeout(() => {
        setIsBouncing(true);
      }, 2000);
    }
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

  useEffect(() => {
    const startBouncing = setTimeout(() => {
      setIsBouncing(true);
    }, 3000);

    return () => {
      clearTimeout(startBouncing);
      if (bounceTimeoutRef.current) {
        clearTimeout(bounceTimeoutRef.current);
      }
    };
  }, []);

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
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                className={`relative w-16 h-16 ${
                  isBouncing && !isDragging && !isActive 
                    ? 'animate-bounce' 
                    : ''
                }`}
              >
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
            <p>Hello, I&apos;m Bonbon. I&apos;m here to help</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default AnimatedTooltip;