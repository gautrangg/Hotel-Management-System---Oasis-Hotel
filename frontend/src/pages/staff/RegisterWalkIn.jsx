import React from 'react';
import "@assets/style.css"; 
import "@assets/customer/RegisterWalkIn.css";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";
import RegisterWalkin from '@components/feature/customer/RegisterWalk-in.jsx';

export default function RegisterWalkIn() {
    return (
        <div className="staff-dashboard">
            <Header />
            <Sidebar />

            <main className="staff-main-content">
                <RegisterWalkin />
            </main>
        </div>
    );
};