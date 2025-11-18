import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function RoomStatusChart({ data }) {
    
    const COLORS = {
        'Available': '#2ecc71',
        'Occupied': '#e67e22',
        'Cleaning': '#3498db',
        'Maintenance': '#e74c3c'
    };

    const chartData = Object.entries(data).map(([name, value]) => ({
        name,
        value
    }));

    const totalRooms = chartData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const percent = ((payload[0].value / totalRooms) * 100).toFixed(1);
            return (
                <div className="c-custom-tooltip">
                    <p className="c-tooltip-label">{payload[0].name}</p>
                    <p className="c-tooltip-value">
                        {payload[0].value} rooms ({percent}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="c-room-status-chart">
            <h2>Room Composition</h2>
            
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#95a5a6'} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>

            <div className="c-room-total">
                <p>{totalRooms} rooms total</p>
            </div>
        </div>
    );
}