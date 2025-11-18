import React from 'react';
import "@assets/style.css";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";
import ListRooms from '@components/feature/room/ListRooms'; 

export default function RoomManagement() {
    return (
        <div className="staff-dashboard">
            <Header />
            <Sidebar />

            <main className="staff-main-content">
                <ListRooms />
            </main>
        </div>
    );
};