import React from "react";
import "@assets/servicerequest/HistoryRequest.css";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";
import ListRoomForBook from "@components/feature/room/ListRoomForBook";

export default function RoomForBook() {
    return (
        <div className="schedule-dashboard">
            <Header />
            <Sidebar />
            <div className="staff-main-content">
                <ListRoomForBook />
            </div>
        </div>
    );
}
