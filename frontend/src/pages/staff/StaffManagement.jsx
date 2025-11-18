import React from "react";
import "@assets/style.css";
import AddStaff from "@components/feature/staff/AddStaff";
import ListStaffs from "@components/feature/staff/ListStaffs";
import Sidebar from "@components/layout/Sidebar"
import Header from "@components/layout/Header"


export default function StaffManagement() {

    return (
        <div className="staff-dashboard">
            <Header />
            <Sidebar />
            <div className="staff-main-content">
                <ListStaffs />
            </div>
        </div>
    );
}