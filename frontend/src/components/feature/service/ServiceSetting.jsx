// ServiceSetting.jsx
import React, { useState, useMemo } from "react";
import useServices from "@hooks/useServices";
import useServiceCategories from "@hooks/useServiceCategories";
import ServiceCard from "./ServiceCard";
import ServiceDetail from "./ServiceDetail";
import "@assets/service/ServiceSetting.css";

export default function ServiceSetting({ onBack, onOpenSettings }) {
  const { services, loading, error, fetchServices, removeServicePermanently } =
    useServices();
  const { getCategoryById } = useServiceCategories();

  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("serviceName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);

  const perPage = 6;

  const filteredServices = useMemo(() => {
    let data = services?.filter((s) => !s.active) || [];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (s) =>
          s.serviceName?.toLowerCase().includes(term) ||
          s.description?.toLowerCase().includes(term)
      );
    }

    data = [...data].sort((a, b) => {
      const valA = a[sortKey]?.toString().toLowerCase();
      const valB = b[sortKey]?.toString().toLowerCase();
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [services, searchTerm, sortKey, sortOrder]);

  const totalPages = Math.ceil(filteredServices.length / perPage);
  const paginated = filteredServices.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const handlePermanentDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this service?"
      )
    ) {
      try {
        await removeServicePermanently(id, true);
        fetchServices();
        setSelectedService(null);
      } catch (err) {
        console.error("Permanent deletion failed:", err);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (filteredServices.length === 0) {
      alert("No deleted services to remove.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently delete ${filteredServices.length} recently deleted services?`
      )
    ) {
      return;
    }

    try {
      for (const service of filteredServices) {
        await removeServicePermanently(service.serviceId, true);
      }
      alert("All deleted services have been permanently removed.");
      setSelectedService(null);
      fetchServices();
    } catch (err) {
      console.error("Error while deleting all:", err);
      alert("An error occurred while deleting all services.");
    }
  };

  if (loading) return <p className="ss-loading">Loading services...</p>;
  if (error)
    return (
      <div className="ss-error-box">
        <p>Error: {error}</p>
        <button onClick={fetchServices}>Retry</button>
      </div>
    );

  return (
    <div className="ss-container">
      <div className="ss-header">
        <div className="ss-header-left">
          <button className="ss-back-btn" onClick={onBack}>
            ⬅ Back to Service List
          </button>
          <h1>Recently Deleted Services</h1>
          <p>Total: {filteredServices.length}</p>
        </div>
      </div>

      <div className="ss-control-bar">
        <div className="ss-left-controls">
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            Sort by {sortKey === "serviceName" ? "name" : "price"}{" "}
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>

        <div className="ss-right-controls">
          <button className="ss-delete-all-btn" onClick={handleDeleteAll}>
            Delete All
          </button>
        </div>
      </div>

      <div className="ss-main-content">
        <div className="ss-service-list">
          {paginated.length > 0 ? (
            paginated.map((service) => (
              <ServiceCard
                key={service.serviceId}
                service={service}
                selected={selectedService?.serviceId === service.serviceId}
                onClick={() => setSelectedService(service)}
                onDeletePermanent={() =>
                  handlePermanentDelete(service.serviceId)
                }
              />
            ))
          ) : (
            <p>No deleted services.</p>
          )}
        </div>

        <div className="ss-service-detail">
          {selectedService ? (
            <ServiceDetail
              service={selectedService}
              category={getCategoryById(selectedService?.categoryId)}
              actionButton={
                <button
                  className="ss-delete-btn"
                  onClick={() =>
                    handlePermanentDelete(selectedService.serviceId)
                  }
                >
                  🗑️ Permanently Delete
                </button>
              }
            />
          ) : (
            <div className="ss-empty-detail">
              <p>Select a service to view details</p>
            </div>
          )}
        </div>
      </div>

      <div className="ss-pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={page === i + 1 ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
