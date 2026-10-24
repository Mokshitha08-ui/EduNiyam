import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const DEFAULT_TREND_DATA = [
  { month: 'May 26', received: 42, processed: 38 },
  { month: 'Jun 26', received: 65, processed: 52 },
  { month: 'Jul 26', received: 98, processed: 74 },
  { month: 'Aug 26', received: 140, processed: 110 },
  { month: 'Sep 26', received: 185, processed: 155 },
  { month: 'Oct 26', received: 120, processed: 104 },
];

export const ProcessingTrendChart = ({ data = DEFAULT_TREND_DATA }) => {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f2942" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#0f2942" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '12px'
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
          />
          <Area
            type="monotone"
            name="Applications Received"
            dataKey="received"
            stroke="#0f2942"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorReceived)"
          />
          <Area
            type="monotone"
            name="Applications Processed"
            dataKey="processed"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorProcessed)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
