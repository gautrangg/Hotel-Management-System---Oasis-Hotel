import React from "react";
import "@assets/booking/RecepBookingPayment.css";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";
import RecepBookingPayment from "@components/feature/payment/RecepBookingPayment"

export default function BookingPayment() {
    return (
        <div className="schedule-dashboard">
            <Header />
            <Sidebar />
            <div className="staff-main-content">
                <RecepBookingPayment />
            </div>
        </div>
    );
}
