// RequestService.jsx
import React, { useState, useEffect, useMemo } from "react";
import "@assets/style.css";
import "@assets/customer/RegisterWalkIn.css";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";
import "@assets/servicerequest/RequestService.css";
import AssignStaffModal from "./AssignStaffModal";
import useServiceRequests from "@hooks/useServiceRequests";

export default function RequestService() {
  const { fetchRequestDetails } = useServiceRequests();
  const [requests, setRequests] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const loadRequestDetails = async () => {
    const data = await fetchRequestDetails();
    setRequests(data);
  }


  useEffect(() => {
    // const fetchRequests = async () => {
    //   try {
    //     const res = await fetch(
    //       "http://localhost:8080/api/service-requests/details",
    //       { headers: getAuthHeaders("application/json") }
    //     );
    //     const data = await res.json();
    //     console.log(data);

    //     setRequests(data);
    //   } catch (error) {
    //     console.error("Error fetching service requests:", error);
    //   }
    // };
    // fetchRequests();
    loadRequestDetails();
  }, []);


  console.log(requests);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchFilter = filter === "All" || r.status === filter;
      const name = r.customerName || "";
      const service = r.serviceName || "";
      const matchSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        service.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [requests, filter, search]);


  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="staff-dashboard">
      <Header />
      <Sidebar />
      <main className="staff-main-content">
        <div className="rs-container">
          <div className="rs-header">
            <h2 className="rs-title">Request Service ({requests.length})</h2>
            <input
              type="text"
              placeholder="Search by Name, Service"
              className="rs-search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <i className="fas fa-filter rs-filter-icon"></i>
          </div>

          <div className="rs-filter-tabs">
            {["All", "Pending", "Assigned", "In Progress",/**"Completed"*/ "Cancelled"].map((tab) => (
              <button
                key={tab}
                className={`rs-tab ${filter === tab ? "active" : ""}`}
                onClick={() => {
                  setFilter(tab);
                  setPage(1);
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="rs-grid">
            {paginated.map((req, index) => (
              <div key={index} className="rs-card">
                <div className="rs-card-header">
                  <img
                    src={`http://localhost:8080/upload/avatar/${req.customerAvatar}`}
                    alt={req.customerName}
                    className="rs-avatar"
                  />
                  <div>
                    <h4 className="rs-name">{req.customerName}</h4>
                    <p className="rs-room">Room: {req.roomNumber}</p>
                  </div>
                </div>
                <div className="rs-card-body">
                  <p>{req.serviceName}</p>
                  <p>Quantity: {req.quantity}</p>
                  <p>Assignee: {req.staffName || "None"}</p>
                  <p className="rs-note">Note: {req.note || "N/A"}</p>
                  <p className="rs-date">
                    Expected time: {req.expectedTime ? new Date(req.expectedTime).toLocaleString() : "None"}
                  </p>
                </div>
                <div className="rs-card-footer">
                  <span
                    className={`rs-status ${req.status === "Pending"
                      ? "pending"
                      : req.status === "Completed"
                        ? "completed"
                        : "cancelled"
                      }`}
                  >
                    ● {req.status}
                  </span>
                  {req.status === "Pending" && (
                    <button
                      className="rs-assign-btn"
                      onClick={() => {
                        setSelectedRequest(req);
                        setAssignModalOpen(true);
                      }}
                    >
                      Assign Now
                    </button>
                  )}
                </div>
              </div>
            ))}
            {paginated.length === 0 && (
              <div className="rs-empty-message">
                Empty
              </div>
            )}
          </div>

          <AssignStaffModal
            open={assignModalOpen}
            onClose={() => setAssignModalOpen(false)}
            request={selectedRequest}
            onAssign={async () => {
              setAssignModalOpen(false);
              loadRequestDetails();
            }}
          />

          <div className="rs-pagination">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`rs-page-btn ${page === i + 1 ? "active" : ""}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
