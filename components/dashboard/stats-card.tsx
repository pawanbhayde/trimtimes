'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  id?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  description,
  id
}: StatsCardProps) {
  // Let's alternate borders for visual interest or default to elegant gold/accent
  const isAltCard = title.toLowerCase().includes('revenue') || title.toLowerCase().includes('sales') || title.toLowerCase().includes('inactive');
  const borderLeftColor = isAltCard ? 'border-l-[#1a1a1a]' : 'border-l-[#d4a574]';

  return (
    <div 
      className={cn(
        "bg-white p-6 rounded-sm border-y border-r border-[#1a1a1a]/5 border-l-4 shadow-sm hover:border-neutral-300 transition duration-300 flex items-start justify-between",
        borderLeftColor
      )}
      id={id || `stats-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/40 font-extrabold font-sans">
          {title}
        </p>
        <h3 className="text-3xl font-sans font-bold text-[#1a1a1a] tracking-tight">
          {value}
        </h3>
        
        {/* Trend Indicator */}
        {(change || description) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {change && (
              <span className={cn(
                "text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm font-extrabold font-mono",
                changeType === 'positive' && "bg-emerald-50 text-emerald-700 border border-emerald-100",
                changeType === 'negative' && "bg-rose-50 text-rose-700 border border-rose-100",
                changeType === 'neutral' && "bg-neutral-50 text-neutral-600 border border-neutral-150"
              )}>
                {change}
              </span>
            )}
            {description && (
              <span className="text-[10px] text-[#8b7355] font-serif italic font-medium">
                {description}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-2.5 rounded-sm bg-[#fafaf9] border border-[#1a1a1a]/5 text-[#8b7355]">
        <Icon className="h-4 w-4 stroke-[1.8]" />
      </div>
    </div>
  );
}
