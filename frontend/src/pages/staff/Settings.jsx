import React from 'react';
import Swal from 'sweetalert2';
import "@assets/price/PriceAdjustment.css";
import Sidebar from "@components/layout/Sidebar"
import Header from "@components/layout/Header"
import PriceAdjustment from "@components/feature/price/PriceAdjustment.jsx";

export default function Settings() {
    return (
        <div className="staff-dashboard">
            <Header />
            <Sidebar />
            <div className="staff-main-content">
                <PriceAdjustment />
            </div>
        </div>
    );
}