import React from "react";
import "@assets/schedule/mySchedule.css";
import "@assets/servicerequest/HistoryRequest.css";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";
import ListSchedules from "@components/feature/schedule/ListSchedules";

export default function MySchedule() {
    return (
        <div className="schedule-dashboard">
            <Header />
            <Sidebar />
            <div className="schedule-main-content">
                <ListSchedules />
            </div>
        </div>
    );
}
