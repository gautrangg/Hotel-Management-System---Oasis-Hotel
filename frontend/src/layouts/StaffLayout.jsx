import React from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

export default function StaffLayout({ children }) {
    return (
        <div className="staff-dashboard">
            <Header />
            <Sidebar />
            <div className="staff-main-content">
                {children}
            </div>
        </div>
    );
}
