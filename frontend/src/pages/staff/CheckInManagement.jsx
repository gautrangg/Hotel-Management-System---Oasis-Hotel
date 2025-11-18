import React from 'react';
import "@assets/style.css"; 
import "@assets/booking/CheckInManagement.css";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";
import CheckInList from '@components/feature/checkin/CheckInList';

export default function CheckInManagement() {
    return (
        <div className="staff-dashboard">
            <Header />
            <Sidebar />

            <main className="staff-main-content">
                <div className="page-header">
                    <h1>Check-in Management</h1>
                    <p>Manage guest check-ins and room assignments</p>
                </div>
                <CheckInList />
            </main>
        </div>
    );
};