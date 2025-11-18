import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function RevenueChart({ data }) {
    
    const chartData = data.map(item => ({
        name: item.label,
        revenue: parseFloat(item.revenue || 0)
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="c-custom-tooltip">
                    <p className="c-tooltip-label">{payload[0].payload.name}</p>
                    <p className="c-tooltip-value">
                        {payload[0].value.toLocaleString()}đ
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="c-revenue-chart">
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="name" 
                        stroke="#666"
                        style={{ fontSize: '0.875rem' }}
                    />
                    <YAxis 
                        stroke="#666"
                        style={{ fontSize: '0.875rem' }}
                         width={100}
                        tickFormatter={(value) => `${value.toLocaleString()}đ`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(217, 103, 4, 0.1)' }} />
                    <Bar 
                        dataKey="revenue" 
                        fill="#D96704" 
                        radius={[8, 8, 0, 0]}
                        maxBarSize={60}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}