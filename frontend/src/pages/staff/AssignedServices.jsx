import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";

import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";
import "@assets/servicerequest/AssignedServices.css";
import { Search, Filter, Check, History, X } from "lucide-react";

export default function AssignedServices() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [staffId, setStaffId] = useState(null);

  const ITEMS_PER_PAGE = 6;

  // Fetch assigned services - now returns all statuses from backend
  const fetchData = useCallback(async () => {
    if (!staffId) return;

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/service-requests/assigned/${staffId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];

      // Display all service requests regardless of status
      setRequests(Array.isArray(data) ? data : []);
      setFilteredRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load assigned requests failed:", err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to load assigned services.",
      });
    } finally {
      setLoading(false);
    }
  }, [staffId, token]);

  // Fetch completed services history
  const fetchCompletedHistory = useCallback(async () => {
    if (!staffId) return;

    setLoadingHistory(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/service-requests/completed/${staffId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      setCompletedRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load completed history failed:", err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to load completed history.",
      });
    } finally {
      setLoadingHistory(false);
    }
  }, [staffId, token]);

  useEffect(() => {
    if (!token) {
      navigate("/staff/login");
      return;
    }
    try {
      const payload = jwtDecode(token);
      const id = payload?.staffId || payload?.id || payload?.userId;
      if (!id) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Invalid authentication token.",
        });
        navigate("/staff/login");
      } else {
        setStaffId(id);
      }
    } catch (err) {
      console.log(err);
      localStorage.removeItem("token");
      Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
      });
      navigate("/staff/login");
    }
  }, [navigate, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle sidebar and fetch history when opened
  const toggleSidebar = () => {
    if (!sidebarOpen) {
      fetchCompletedHistory();
    }
    setSidebarOpen(!sidebarOpen);
  };

  const handleUpdateStatus = async (requestId, newStatus, currentStatus) => {
    if (!requestId) {
      Swal.fire("Error", "Cannot update: missing request ID.", "error");
      return;
    }

    // If status is the same, do nothing
    if (newStatus === currentStatus) {
      return;
    }



    const result = await Swal.fire({
      title: "Update Status?",
      text: `Change status to "${newStatus}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    });

    if (currentStatus == "Completed" || currentStatus == "Cancelled") {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Can not update status because it's completed or cancelled",
      });
      return;
    }

    if (result.isConfirmed) {
      setUpdatingId(requestId);
      try {
        const res = await fetch(
          `http://localhost:8080/api/service-requests/${requestId}/status`,
          {
            method: "PUT",
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `Failed with status ${res.status}`);
        }


        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: `Status has been changed to "${newStatus}".`,
          timer: 1500,
          showConfirmButton: false,
        });


        await fetchData();

      } catch (err) {
        console.error("Update failed:", err);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: err.message || "Could not update status.",
        });
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = requests;

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((r) => {
        const status = (r.status || "").toString().trim();
        return status === statusFilter;
      });
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          (r.customerName && r.customerName.toLowerCase().includes(term)) ||
          (r.roomNumber &&
            r.roomNumber.toString().toLowerCase().includes(term)) ||
          (r.serviceName && r.serviceName.toLowerCase().includes(term))
      );
    }

    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [requests, statusFilter, searchTerm]);

    useEffect(() => {
      applyFilters();
    }, [applyFilters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  return (
    <div className="staff-dashboard">
      <Header />
      <Sidebar />
      <main className="staff-main-content">
        <div className="as-container">
          <div className="as-header-wrapper">
            <h2 className="as-title">
              Services Assigned to You ({filteredRequests.length})
            </h2>
            <button
              className="as-history-btn"
              onClick={toggleSidebar}
              title="View completed history"
            >
              <History size={18} />
              <span>History</span>
            </button>
          </div>

          <div className="as-controls">
            <div className="as-searchbar">
              <Search className="as-search-icon" size={14} />
              <input
                type="text"
                placeholder="Search by name, room, service..."
                value={searchTerm}
                onChange={handleSearch}
                aria-label="Search by name, room, or service"
              />
              <Filter className="as-filter-icon" size={14} />
            </div>
          </div>

          {/* Status Filter Buttons */}
          <div className="as-status-filters">
            <button
              className={`as-filter-btn ${statusFilter === "All" ? "active" : ""}`}
              onClick={() => handleStatusFilter("All")}
            >
              All
            </button>

            <button
              className={`as-filter-btn assigned ${statusFilter === "Assigned" ? "active" : ""}`}
              onClick={() => handleStatusFilter("Assigned")}
            >
              <span className="filter-dot assigned"></span>
              Assigned
            </button>
            {/* <button
              className={`as-filter-btn pending ${statusFilter === "Pending" ? "active" : ""}`}
              onClick={() => handleStatusFilter("Pending")}
            >
              <span className="filter-dot pending"></span>
              Pending
            </button> */}
            <button
              className={`as-filter-btn inprogress ${statusFilter === "In Progress" ? "active" : ""}`}
              onClick={() => handleStatusFilter("In Progress")}
            >
              <span className="filter-dot inprogress"></span>
              In Progress
            </button>
            <button
              className={`as-filter-btn completed ${statusFilter === "Completed" ? "active" : ""}`}
              onClick={() => handleStatusFilter("Completed")}
            >
              <span className="filter-dot completed"></span>
              Completed
            </button>
            <button
              className={`as-filter-btn cancelled ${statusFilter === "Cancelled" ? "active" : ""}`}
              onClick={() => handleStatusFilter("Cancelled")}
            >
              <span className="filter-dot cancelled"></span>
              Cancelled
            </button>
          </div>

          {loading ? (
            <p className="as-empty">Loading...</p>
          ) : filteredRequests.length === 0 ? (
            <p className="as-empty">No services have been assigned.</p>
          ) : (
            <>
              <div className="as-list">
                {currentRequests.map((r, idx) => {
                  const statusLower = (r.status || "").toString().toLowerCase().trim();
                  const statusClass =
                    statusLower === "done" || statusLower === "completed"
                      ? "done"
                      : statusLower === "in progress" || statusLower === "inprogress"
                        ? "inprogress"
                        : statusLower === "cancelled"
                          ? "cancelled"
                          : "pending";
                  const rid = r.requestId;
                  return (
                    <div
                      className={`as-row ${statusClass}`}
                      key={rid ?? `no-id-${idx}`}
                    >
                      <div className="as-left">
                        <img
                          src={`http://localhost:8080/upload/avatar/${r.customerAvatar}`}
                          alt={r.customerName || "Guest"}
                          className="as-avatar"
                        />
                        <div className="as-person">
                          <div className="as-person-name">
                            {r.customerName || "Guest"}
                          </div>
                          <div className="as-person-room">
                            Room: {r.roomNumber || "-"}
                          </div>
                        </div>
                      </div>
                      <div className="as-status">
                        <span className={`as-dot ${statusClass}`}></span>
                        <span className="as-status-text">
                          {r.status || "Pending"}
                        </span>
                      </div>
                      <div className="as-service">
                        <div className="as-service-name">
                          {r.serviceName || "-"}
                        </div>
                        <div className="as-service-small">{r.note || ""}</div>
                      </div>
                      <div className="as-qty">
                        Quantity: <strong>{r.quantity ?? "-"}</strong>
                      </div>
                      <div className="as-date">
                        Date:{" "}
                        {r.expectedTime
                          ? new Date(r.expectedTime).toLocaleDateString("en-US")
                          : "-"}
                      </div>
                      <div className="as-action">
                        <select
                          className="as-status-select"
                          value={r.status || "Pending"}
                          onChange={(e) =>
                            handleUpdateStatus(rid, e.target.value, r.status)
                          }
                          disabled={updatingId === rid}
                          title="Update status"
                        >
                          {/* <option value="Pending">Pending</option> */}
                          <option value="Assigned">Assigned</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="as-pagination">
                  <button
                    className="as-page-btn as-page-prev"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  <div className="as-page-numbers">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            className={`as-page-btn as-page-number ${currentPage === pageNumber ? "active" : ""
                              }`}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return <span key={pageNumber} className="as-page-ellipsis">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    className="as-page-btn as-page-next"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* History Sidebar */}
        {sidebarOpen && (
          <div className="as-sidebar-overlay" onClick={toggleSidebar}></div>
        )}
        <div className={`as-history-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="as-sidebar-header">
            <h3>Completed History</h3>
            <button className="as-sidebar-close" onClick={toggleSidebar}>
              <X size={20} />
            </button>
          </div>

          <div className="as-sidebar-content">
            {loadingHistory ? (
              <p className="as-sidebar-empty">Loading history...</p>
            ) : completedRequests.length === 0 ? (
              <p className="as-sidebar-empty">No completed services yet.</p>
            ) : (
              <div className="as-sidebar-list">
                {completedRequests.map((r, idx) => (
                  <div
                    className="as-sidebar-item"
                    key={r.requestId ?? `hist-${idx}`}
                  >
                    <div className="as-sidebar-item-header">
                      <img
                        src={`http://localhost:8080/upload/avatar/${r.customerAvatar}`}
                        alt={r.customerName || "Guest"}
                        className="as-sidebar-avatar"
                      />
                      <div className="as-sidebar-person">
                        <div className="as-sidebar-name">
                          {r.customerName || "Guest"}
                        </div>
                        <div className="as-sidebar-room">
                          Room {r.roomNumber || "-"}
                        </div>
                      </div>
                    </div>
                    <div className="as-sidebar-service">
                      {r.serviceName || "-"}
                    </div>
                    {r.note && <div className="as-sidebar-note">{r.note}</div>}
                    <div className="as-sidebar-meta">
                      <span className="as-sidebar-qty">
                        Qty: {r.quantity ?? "-"}
                      </span>
                      <span className="as-sidebar-date">
                        {r.expectedTime
                          ? new Date(r.expectedTime).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                          : "-"}
                      </span>
                    </div>
                    <div className="as-sidebar-status-badge">
                      <span className="as-sidebar-status-dot"></span>
                      Completed
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
