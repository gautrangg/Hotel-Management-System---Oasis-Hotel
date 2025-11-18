import React from "react";

export default function DashboardKPICard({ title, value, change, icon, subtitle }) {
    const isPositive = change >= 0;
    
    return (
        <div className="c-dashboard-kpi-card">
            <div className="c-kpi-header">
                <span className="c-kpi-title">{title}</span>
                {change !== null && change !== undefined && (
                    <span className={`c-kpi-change ${isPositive ? 'positive' : 'negative'}`}>
                        <i className={`bx ${isPositive ? 'bx-trending-up' : 'bx-trending-down'}`}></i>
                        {Math.abs(change).toFixed(1)}%
                    </span>
                )}
            </div>
            
            <div className="c-kpi-body">
                <div className="c-kpi-value-section">
                    <h2 className="c-kpi-value">{value}</h2>
                    <p className="c-kpi-subtitle">{subtitle}</p>
                </div>
                <div className="c-kpi-icon">
                    <i className={`bx ${icon}`}></i>
                </div>
            </div>
        </div>
    );
}