import React from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import CheckOutList from '../../components/feature/checkout/CheckOutList';

export default function CheckOutManagement() {
    return (
        <div className="staff-dashboard">
            <Sidebar />
            <div className="staff-main-content">
                <Header />
                <div className="staff-content">
                    <CheckOutList />
                </div>
            </div>
        </div>
    );
}