import React from "react";
import Header from "@components/layout/Header";
import CustomerViewServices from "@components/feature/service/CustomerViewServices";
import CustomerHeader from "@components/layout/CustomerHeader";
import Footer from "@components/layout/Footer";
export default function ServicesPage() {
    return (
        <div className="staff-dashboard">
            <CustomerHeader />

            <CustomerViewServices />
            <Footer />
        </div>
    );

}
