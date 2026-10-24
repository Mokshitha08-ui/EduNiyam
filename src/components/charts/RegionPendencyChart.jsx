import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const DEFAULT_REGION_DATA = [
  { region: 'South-Western', pending: 18, overdue: 4 },
  { region: 'Western', pending: 25, overdue: 7 },
  { region: 'Northern', pending: 20, overdue: 5 },
  { region: 'Southern', pending: 16, overdue: 2 },
  { region: 'Eastern', pending: 12, overdue: 3 },
  { region: 'Central', pending: 10, overdue: 2 },
  { region: 'North-Western', pending: 8, overdue: 1 }
];

export const RegionPendencyChart = ({ data = DEFAULT_REGION_DATA }) => {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="region"
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
            tick={{ fill: '#64748b', fontSize: 11 }}
            angle={-20}
            textAnchor="end"
            interval={0}
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
              fontSize: '12px'
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Bar
            name="Pending In Progress"
            dataKey="pending"
            fill="#20527b"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            name="Overdue / Critical"
            dataKey="overdue"
            fill="#e11d48"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
