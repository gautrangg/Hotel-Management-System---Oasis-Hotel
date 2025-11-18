import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import "@assets/staff/ManagerDashboard.css";
import Header from "@components/layout/Header";
import Sidebar from "@components/layout/Sidebar";
import DashboardKPICard from "@components/feature/dashboard/DashboardKPICard";
import RevenueChart from "@components/feature/dashboard/RevenueChart";
import RoomStatusChart from "@components/feature/dashboard/RoomStatusChart";
import TodayBookingsTable from "@components/feature/dashboard/TodayBookingsTable";

export default function ManagerDashboard() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("week");
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/staff/login");
            return;
        }

        try {
            const payload = jwtDecode.default ? jwtDecode.default(token) : jwtDecode(token);
            const role = payload.role?.toUpperCase();
            
            if (role !== "ADMIN" && role !== "MANAGER") {
                navigate("/staff/login");
                return;
            }
        } catch (err) {
            console.error("Invalid token", err);
            navigate("/staff/login");
        }
    }, [navigate]);

    useEffect(() => {
        fetchDashboardData();
    }, [period]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:8080/api/dashboard?period=${period}`,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            
            if (!response.ok) {
                throw new Error("Failed to fetch dashboard data");
            }
            
            const data = await response.json();
            setDashboardData(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching dashboard:", err);
            setError("Unable to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="staff-dashboard">
                <Header />
                <Sidebar />
                <div className="staff-main-content">
                    <div className="c-dashboard-loading">
                        <i className="bx bx-loader-alt bx-spin"></i>
                        <p>Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="staff-dashboard">
                <Header />
                <Sidebar />
                <div className="staff-main-content">
                    <div className="c-dashboard-error">
                        <i className="bx bx-error-circle"></i>
                        <p>{error}</p>
                        <button onClick={fetchDashboardData} className="c-retry-btn">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="staff-dashboard">
            <Header />
            <Sidebar />
            
            <div className="staff-main-content">
                <div className="c-dashboard-container">
                    
                    {/* Header */}
                    <div className="c-dashboard-header">
                        <div>
                            <h1>Dashboard</h1>Welcome back! Here's what's happening today.
                            <p>{dashboardData.periodStart} - {dashboardData.periodEnd}</p>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="c-dashboard-kpi-cards">
                        <DashboardKPICard
                            title="Total Revenue"
                            value={`${dashboardData.totalRevenue?.toLocaleString() || 0}đ`}
                            change={dashboardData.revenueChangePercent}
                            icon="bx-dollar-circle"
                            subtitle="Revenue"
                        />
                        <DashboardKPICard
                            title="Available Rooms"
                            value={dashboardData.availableRooms || 0}
                            change={dashboardData.availableChangePercent}
                            icon="bx-door-open"
                            subtitle="Rooms"
                        />
                        <DashboardKPICard
                            title="Occupied Rooms"
                            value={dashboardData.occupiedRooms || 0}
                            change={dashboardData.occupiedChangePercent}
                            icon="bx-bed"
                            subtitle="Rooms"
                        />
                        <DashboardKPICard
                            title="Working Staff"
                            value={dashboardData.workingStaffToday || 0}
                            change={dashboardData.staffChangePercent}
                            icon="bx-user-check"
                            subtitle="Staff"
                        />
                    </div>

                    {/* Revenue Chart */}
                    <div className="c-dashboard-chart-section">
                        <div className="c-chart-header">
                            <h2>Revenue Statistics</h2>
                            <div className="c-chart-filters">
                                <button
                                    className={period === "week" ? "active" : ""}
                                    onClick={() => setPeriod("week")}
                                >
                                    Week
                                </button>
                                <button
                                    className={period === "month" ? "active" : ""}
                                    onClick={() => setPeriod("month")}
                                >
                                    Month
                                </button>
                                <button
                                    className={period === "year" ? "active" : ""}
                                    onClick={() => setPeriod("year")}
                                >
                                    Year
                                </button>
                            </div>
                        </div>
                        <RevenueChart data={dashboardData.revenueChart || []} />
                    </div>

                    {/* Bottom Grid */}
                    <div className="c-dashboard-bottom-grid">
                        <TodayBookingsTable bookings={dashboardData.todayBookings || []} />
                        <RoomStatusChart data={dashboardData.roomStatusStats || {}} />
                    </div>

                </div>
            </div>
        </div>
    );
}