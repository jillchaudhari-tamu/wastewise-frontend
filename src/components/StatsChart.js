import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StatsChart = ({ stats }) => {
  const data = [
    { name: 'Recyclable', value: stats.Recyclable || 0 },
    { name: 'Compostable', value: stats.Compostable || 0 },
    { name: 'Trash', value: stats.Trash || 0 },
    { name: 'Hazardous', value: stats.Hazardous || 0 },
  ];

  return (
    <div className="mt-8 mb-4 w-full h-64">
      <h3 className="text-center text-lg font-semibold mb-3">Your Waste Breakdown</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#38bdf8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;
