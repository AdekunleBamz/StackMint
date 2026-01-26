'use client';

import { useRef, useState, useEffect } from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

export default function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div 
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-purple-500/20 rounded-2xl p-8 transition-all duration-500 group overflow-hidden ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${isHovered ? 'border-purple-500/50 shadow-xl shadow-purple-500/10 -translate-y-2' : ''}`}
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      
      <div className="relative z-10">
        <div className={`w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
          <span className="text-4xl">{icon}</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
        
        {/* Learn more link */}
        <div className={`mt-4 flex items-center gap-2 text-purple-400 text-sm font-medium transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
          <span>Learn more</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
