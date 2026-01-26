'use client';

import { useEffect, useState, useRef } from 'react';

interface StatItemProps {
  value: string;
  label: string;
  icon: string;
  delay: number;
}

function StatItem({ value, label, icon, delay }: StatItemProps) {
  const [isVisible, setIsVisible] = useState(false);
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
      className={`text-center p-6 bg-gray-900/30 rounded-2xl border border-purple-500/10 hover:border-purple-500/30 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-gray-400 mt-2 text-sm uppercase tracking-wider">{label}</div>
    </div>
  );
}

export default function Stats() {
  const stats = [
    { label: 'NFTs Minted', value: '1,234', icon: '🎨' },
    { label: 'Collections', value: '56', icon: '📦' },
    { label: 'Total Volume', value: '5.2K STX', icon: '💰' },
    { label: 'Creators', value: '128', icon: '👥' },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-12">Platform Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatItem key={stat.label} {...stat} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
