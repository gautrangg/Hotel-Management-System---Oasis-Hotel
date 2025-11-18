import React from "react";
import "@assets/servicerequest/CustomerServiceDetail.css";
import useServiceRequests from "@hooks/useServiceRequests";

export default function CustomerServiceDetail({ service, onClose }) {
  const { addRequest } = useServiceRequests();

  if (!service) return null;

  const handleRequest = async () => {
    try {
      await addRequest(service);
      alert(`Request dịch vụ "${service.serviceName}" thành công!`);
      onClose();
    } catch (err) {
      alert("Request thất bại: " + err.message);
    }
  };

  return (
    <div className="service-detail-overlay" onClick={onClose}>
      <div className="service-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="detail-body">
          <div className="left">
            <img
              src={service.image ? `http://localhost:8080/upload/service/${service.image}` : "https://picsum.photos/id/237/400/300"}
              alt={service.serviceName}
            />
            <div className="info">
              <h2>{service.serviceName}</h2>
              {service.categoryName && <span className="category-tag">{service.categoryName}</span>}
              <div className="description">
                <h3>Description</h3>
                <p>{service.description}</p>
              </div>
            </div>
          </div>

          <div className="right">
            <p className="price">{service.pricePerUnit?.toLocaleString()} VND</p>
            <p className="availability"><span className="dot available"></span> Available</p>
            <div className="actions">
              <button className="request-btn" onClick={handleRequest}>Request Now</button>
              <button className="report-btn">Send Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
