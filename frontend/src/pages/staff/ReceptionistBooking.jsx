import React from "react";
import "@assets/booking/RecepBookingForm.css";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";
import RecepBookingForm from "@components/feature/room/RecepBookingForm"

export default function ReceptionistBooking() {
    return (
        <div className="schedule-dashboard">
            <Header />
            <Sidebar />
            <div className="schedule-main-content">
                <RecepBookingForm />
            </div>
        </div>
    );
}
