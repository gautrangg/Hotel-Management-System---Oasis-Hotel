import "@assets/service/ServiceCard.css";
import React from "react";
import useServiceRequests from "@hooks/useServiceRequests";
import useServiceCategories from "@hooks/useServiceCategories";

export default function ServiceCard({ service, selected, onClick }) {
  const { getStatusByServiceId } = useServiceRequests();
  const { getCategoryById } = useServiceCategories();

  const status = ""; //getStatusByServiceId(service.serviceId);

  const statusColor = {
    Pending: "text-yellow-500",
    Approved: "text-green-500",
    Rejected: "text-red-500",
    Completed: "text-blue-500",
  }[status] || "text-gray-400";

  const category = getCategoryById(service.categoryId);

  return (
    <div
      onClick={onClick}
      className={`sc-service-card ${selected ? "selected" : ""}`}
    >
      <div className="sc-service-info">
        {/* Service Name + Category badge */}
        <div className="sc-name-category">
          <h2>{service.serviceName}</h2>
          <span className="sc-category-badge">{category?.categoryName ?? "None"}</span>
        </div>

        {/* Short description */}
        {service.shortDesc && <p className="sc-desc">{service.shortDesc}</p>}

        <br></br>

        {/* Status + Price */}
        <div className="sc-meta">
          <span className={`sc-dot ${statusColor}`}>● {status}</span>
          <span className="sc-price">
            {Number(service.pricePerUnit || 0).toLocaleString("vi-VN")} VNĐ
          </span>
        </div>
      </div>

      <img
        src={
          service.image
            ? `http://localhost:8080/upload/service/${service.image}`
            : "https://picsum.photos/id/237/200/150"
        }
        alt={service.serviceName}
        className="sc-thumb"
      />
    </div>

  );
}
