import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const STAGE_COLORS = {
  'Application Submission': '#94a3b8',
  'Document Scrutiny': '#3880b5',
  'EVC Physical Inspection': '#f59e0b',
  'SAC / SHC Hearing': '#8b5cf6',
  'Executive Approval': '#0f2942',
  'Approved / Issued': '#10b981',
};

const DEFAULT_DATA = [
  { name: 'Application Submission', value: 8 },
  { name: 'Document Scrutiny', value: 24 },
  { name: 'EVC Physical Inspection', value: 14 },
  { name: 'SAC / SHC Hearing', value: 6 },
  { name: 'Executive Approval', value: 12 },
  { name: 'Approved / Issued', value: 45 },
];

export const StageDistributionChart = ({ data = DEFAULT_DATA }) => {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value, name) => [`${value} Applications`, name]}
          />
          <Legend
            verticalAlign="bottom"
            height={48}
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STAGE_COLORS[entry.name] || '#64748b'}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
