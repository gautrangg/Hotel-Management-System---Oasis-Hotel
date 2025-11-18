import React, { useState, useMemo } from "react";
import useServices from "@hooks/useServices";
import useServiceCategories from "@hooks/useServiceCategories";
import ServiceCard from "./ServiceCard";
import ServiceDetail from "./ServiceDetail";
import AddService from "./AddService";
import ManageServiceCategories from "./ManageServiceCategories"; 
import "@assets/service/ListService.css";

export default function ListService({ onOpenSettings }) {
  const { services, loading, error, fetchServices } = useServices();
  const { getCategoryById } = useServiceCategories();

  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("serviceName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);

  const perPage = 6;

  const filteredServices = useMemo(() => {
    let data = services?.filter((s) => s.active) || [];

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

  if (loading) return <p className="loading">Loading Service...</p>;
  if (error)
    return (
      <div className="error-box">
        <p>Error: {error}</p>
        <button onClick={fetchServices}>Try Again</button>
      </div>
    );

  return (
    <div className="vulon-list-service">
      <div className="vulon-header">
        <h1>Service</h1>
        <p>List of active services ({filteredServices.length})</p>
      </div>

      <div className="vulon-control-bar">
        <div className="vulon-left-controls">
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

        <div className="vulon-right-controls">
          <button className="hvu-icon-btn" title="Bộ lọc">
            <i className="fas fa-filter"></i>
          </button>
          <button
            className="hvu-icon-btn"
            title="Recent deleted"
            onClick={onOpenSettings}
          >
            <i className="fas fa-cog"></i>
          </button>
          {/* Nút mở popup category */}
          <button
            className="vulon-add-btn"
            onClick={() => setShowManageCategories(true)}
          >
            Service Management
          </button>
          <button className="vulon-add-btn" onClick={() => setShowAdd(true)}>
            + Add Service
          </button>
        </div>
      </div>

      <div className="vulon-main-content">
        <div className="vulon-service-list">
          {paginated.length > 0 ? (
            paginated.map((service) => (
              <ServiceCard
                key={service.serviceId}
                service={service}
                selected={selectedService?.serviceId === service.serviceId}
                onClick={() => setSelectedService(service)}
              />
            ))
          ) : (
            <p>No service found.</p>
          )}
        </div>

        <div className="vulon-service-detail">
          <ServiceDetail
            service={selectedService}
            category={getCategoryById(selectedService?.categoryId)}
            onServiceUpdated={(updatedService) => {
              setSelectedService(updatedService);
              fetchServices();
            }}
            onServiceDeleted={() => {
              setSelectedService(null);
              fetchServices();
            }}
          />
        </div>
      </div>

      <div className="vulon-pagination">
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

      {/* Popup AddService */}
      <AddService
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={() => {
          setShowAdd(false);
          fetchServices();
        }}
      />

      {/* Popup Manage Categories */}
      {showManageCategories && (
        <ManageServiceCategories
          onClose={() => setShowManageCategories(false)}
        />
      )}
    </div>
  );
}
