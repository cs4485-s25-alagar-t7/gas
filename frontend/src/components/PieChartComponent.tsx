import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// Data
const data = [
  { name: "ECSS", value: 128 },
  { name: "JSOM", value: 93 },
  { name: "BBS", value: 58 },
];

// Colors
const COLORS = ["#2ECC71", "#3498DB", "#E74C3C"];

const PieChartComponent = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <h3 className="text-gray-700 font-semibold text-lg text-center mb-4">
        Applicants by School
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;
