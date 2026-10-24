import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'neutral', // 'positive' (green), 'negative' (red), 'warning' (amber), 'neutral'
  variant = 'default',
  onClick,
  className = ''
}) => {
  const iconColors = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-gov-50 text-gov-800',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-rose-50 text-rose-700',
    purple: 'bg-purple-50 text-purple-700',
    blue: 'bg-blue-50 text-blue-700'
  };

  const trendColors = {
    positive: 'text-emerald-700 bg-emerald-50',
    negative: 'text-rose-700 bg-rose-50',
    warning: 'text-amber-700 bg-amber-50',
    neutral: 'text-slate-600 bg-slate-100'
  };

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-200 hover:shadow-elevation hover:border-slate-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
        </div>
        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${
              iconColors[variant] || iconColors.default
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs">
        {subtitle && <span className="text-slate-500">{subtitle}</span>}
        {trend && (
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium ${
              trendColors[trendType] || trendColors.neutral
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {onClick && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
        </div>
      )}
    </div>
  );
};
