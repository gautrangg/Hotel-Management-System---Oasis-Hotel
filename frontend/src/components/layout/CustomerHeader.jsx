import React from "react";
import { NavLink, Navigate } from "react-router-dom";

export default function CustomerHeader() {
    const token = localStorage.getItem("token");
console.log(token);
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return (
        <header className="nav-bar">
            <div className="logo-container">
                <img src="/logo2.png" className="nav-logo" />
            </div>

            <div className="nav-menu">
                <NavLink
                    to="/home"
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    Home
                </NavLink>
                <NavLink
                    to="/rooms"
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    Room
                </NavLink>
                <NavLink
                    to="/services"
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    Service
                </NavLink>
                <NavLink
                    to="/my-bookings"
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    My Booking
                </NavLink>
                <NavLink
                    to="/profile"
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    Profile
                </NavLink>
                
            </div>

            <NavLink to="/search" className="t-orange-btn t-book-now">
                Book Now
            </NavLink>
        </header>
    );
}
