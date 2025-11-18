import React from "react";

import Sidebar from "@components/layout/Sidebar"
import Header from "@components/layout/Header"
import ViewCustomer from "@components/feature/customer/ViewCustomer";



export default function CustomerManagement() {

    return (
        <div className="staff-dashboard">
            <Sidebar />
            <div className="staff-main-content">
                <Header />
                <div className="staff-content">
                    <ViewCustomer />
                </div>
            </div>
        </div>
    );
}
