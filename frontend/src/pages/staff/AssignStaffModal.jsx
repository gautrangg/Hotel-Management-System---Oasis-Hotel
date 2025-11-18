import React, { useEffect, useState } from "react";
import "@assets/servicerequest/AssignStaffModal.css";
import Swal from "sweetalert2";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function AssignStaffModal({ open, onClose, request, onAssign }) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedId(null);
      setError("");
      fetchAvailableStaffs();
    }

  }, [open, request]);

  const requestId = request?.id || request?.requestId || request?.serviceRequestId || request?.serviceId || null;

  async function fetchAvailableStaffs() {
    if (!request) {
      setStaffs([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (requestId) params.append("requestId", requestId);
      if (request?.serviceId) params.append("serviceId", request.serviceId);
      if (requestId) params.append("serviceRequestId", requestId);

      const url = `http://localhost:8080/api/staffs/available-service-staffs?${params.toString()}`;

      const res = await fetch(url, { headers: { ...getAuthHeaders() } });
      if (!res.ok) {
        throw new Error(`Failed to load available staffs (${res.status})`);
      }
      const data = await res.json();
      setStaffs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch staffs");
      setStaffs([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = staffs.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone || "").includes(search)
  );

  async function handleAssign() {
    if (!requestId) {
      setError("Missing request id");
      return;
    }
    if (!selectedId) {
      setError("Please select one staff to assign");
      return;
    }

    const selectedStaff = staffs.find(s => Number(s.staffId) === Number(selectedId));
    if (!selectedStaff) {
      setError("Could not find the selected staff. Please try again.");
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Assignment',
      html: `Are you sure you want to assign <strong>${selectedStaff.fullName}</strong> to this service request?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, assign!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const url = `http://localhost:8080/api/service-requests/${requestId}/assign?staffId=${selectedId}`;

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Assign failed (${res.status})`);
      }
      const updated = await res.json();
      onAssign && onAssign(updated);
      onClose && onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Assign failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="asm-overlay" onClick={onClose}>
      <div className="asm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="asm-header">
          <h3>Assign Staff</h3>
          <button className="asm-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="asm-body">
          <div className="asm-left">
            <div className="asm-image-wrap">
              <img
                src={`http://localhost:8080/upload/service/${request.serviceImage}`}
                alt={request ? request.serviceName : "Service"}
              />
            </div>
            <div className="asm-left-info">
              <h4 className="asm-service-title">{request?.serviceName || "Service"}</h4>
              <p className="asm-requester">Requester: {request?.customerName || "Unknown"}</p>
              <p>Quantity: {request?.quantity ?? 1}</p>
              <p>Room: {request?.roomNumber || "N/A"}</p>
            </div>
          </div>

          <div className="asm-right">
            <div className="asm-right-header">
              <h4>Available Staffs</h4>
              <input
                className="asm-search"
                placeholder="Search by Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="asm-staff-list">
              {loading && <div style={{ padding: 8 }}>Loading...</div>}
              {error && <div style={{ color: "#b52b27", padding: 8 }}>{error}</div>}
              {!loading && filtered.length === 0 && <div style={{ padding: 8 }}>No available staff</div>}

              {filtered.map((s) => {
                const id = s.staffId;
                return (
                  <label key={id} className="asm-staff-item">
                    <div className="asm-staff-left">
                      <input
                        type="radio"
                        name="assignStaff"
                        checked={Number(selectedId) === Number(id)}
                        onChange={() => setSelectedId(Number(id))}
                      />
                      <div className="asm-staff-meta">
                        <div className="asm-staff-name">{s.fullName}</div>
                        <div className="asm-staff-phone">{s.phone}</div>
                      </div>
                      <div className="asm-staff-phone">{s.email}</div>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="asm-note">Assign one staff to handle this service.</div>
            <div className="asm-actions">
              <button className="asm-assign-btn" onClick={handleAssign} disabled={loading}>
                {loading ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
