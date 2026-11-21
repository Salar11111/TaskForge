'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Point = { day: string; ideal: number; actual: number };

export function BurndownChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="actual" stroke="#10b981" />
      </LineChart>
    </ResponsiveContainer>
  );
}