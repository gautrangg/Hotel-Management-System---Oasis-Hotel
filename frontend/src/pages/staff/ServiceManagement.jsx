import React, { useState } from "react";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";
import ListService from "@components/feature/service/ListService";
import ServiceSetting from "@components/feature/service/ServiceSetting";
import "@assets/service/ServiceManagement.css";

export default function ServiceManagement() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="staff-dashboard">
      <Header />
      <Sidebar />

      <div className="staff-main-content">
        {activeTab === "list" && (
          <ListService onOpenSettings={() => setActiveTab("settings")} />
        )}

        {activeTab === "settings" && (
          <ServiceSetting onBack={() => setActiveTab("list")} />
        )}
      </div>
    </div>
  );
}
