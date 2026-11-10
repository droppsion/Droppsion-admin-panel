import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  delta?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  delta,
  isPositive = true,
  subtitle,
  icon: Icon,
  iconColor = 'text-[#FF4D00]',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight font-heading">
          {value}
        </span>

        {delta && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-gray-400 mt-1.5">{subtitle}</p>}
    </div>
  );
}

