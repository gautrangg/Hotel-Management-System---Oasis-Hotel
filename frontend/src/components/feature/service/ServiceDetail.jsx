// ServiceDetail.jsx
import React, { useState } from "react";
import "@assets/service/ServiceDetail.css";
import EditServiceForm from "./EditServiceForm";

export default function ServiceDetail({
  service,
  onServiceUpdated,
  onServiceDeleted,
  category,
  actionButton, 
}) {
  const [editing, setEditing] = useState(false);

  if (!service)
    return <div className="sd-detail-empty">Chọn dịch vụ để xem chi tiết.</div>;

  const statusColor = {
    Available: "green",
    Unavailable: "red",
    Maintenance: "orange",
  }[service.status || "Available"];

  return (
    <div className="sd-detail-box">
      <img
        src={
          service.image
            ? `http://localhost:8080/upload/service/${service.image}`
            : "https://picsum.photos/id/237/200/200"
        }
        alt={service.serviceName}
        className="sd-detail-img"
      />

      <div className="sd-detail-header">
        <div className="sd-detail-name-category">
          <h2>{service.serviceName}</h2>
          <span className="sd-detail-category-badge">
            {category?.categoryName || "None"}
          </span>
        </div>

        {actionButton ? (
          actionButton
        ) : (
          <button className="sd-add-btn" onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </div>

      <p className="sd-desc">{service.description || "Không có mô tả chi tiết."}</p>

      <div className="sd-detail-meta">
        <span style={{ color: statusColor }}>● {service.status}</span>
        <span className="sd-price">
          {new Intl.NumberFormat("vi-VN").format(service.pricePerUnit)} VNĐ
        </span>
      </div>

      {/* Modal chỉnh sửa dịch vụ */}
      {editing && (
        <EditServiceForm
          isOpen={editing}
          item={service}
          onClose={() => setEditing(false)}
          onUpdated={(updated) => {
            onServiceUpdated?.(updated);
          }}
          onDeleted={() => {
            onServiceDeleted?.();
          }}
        />
      )}
    </div>
  );
}
