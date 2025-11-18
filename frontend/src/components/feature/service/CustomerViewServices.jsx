import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useServices from "@hooks/useServices";
import useServiceCategories from "@hooks/useServiceCategories";
import CustomerServiceDetail from "./CustomerServiceDetail";
import "@assets/servicerequest/CustomerViewServices.css";

export default function CustomerViewServices() {
  const navigate = useNavigate();
  const { services, loading, error, fetchServices } = useServices();
  const { getCategoryById, categories } = useServiceCategories();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("price-asc");
  const [page, setPage] = useState(1);
  const [selectedService, setSelectedService] = useState(null);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const perPage = 9;

  const filtered = useMemo(() => {
    let data = services?.filter((s) => s.active) || [];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (s) =>
          s.serviceName?.toLowerCase().includes(term) ||
          s.description?.toLowerCase().includes(term)
      );
    }

    if (minPrice !== "") {
      data = data.filter((s) => s.pricePerUnit >= Number(minPrice));
    }
    if (maxPrice !== "") {
      data = data.filter((s) => s.pricePerUnit <= Number(maxPrice));
    }

    if (selectedCategory) {
      data = data.filter((s) => s.categoryId == selectedCategory);
    }

    data = [...data].sort((a, b) => {
      switch (sortOrder) {
        case "price-asc":
          return a.pricePerUnit - b.pricePerUnit;
        case "price-desc":
          return b.pricePerUnit - a.pricePerUnit;
        case "name-asc":
          return a.serviceName.localeCompare(b.serviceName);
        case "name-desc":
          return b.serviceName.localeCompare(a.serviceName);
        default:
          return 0;
      }
    });

    return data;
  }, [services, searchTerm, minPrice, maxPrice, selectedCategory, sortOrder]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <p className="cvs-loading">Loading...</p>;
  if (error)
    return (
      <div className="cvs-error-box">
        <p>Lỗi: {error}</p>
        <button onClick={fetchServices}>Try again</button>
      </div>
    );

  return (
    <div className="cvs-page">
      <div className="cvs-hero">
        <div className="cvs-hero-overlay">
          <h1 className="cvs-h1">Our Services</h1>
          <p className="cvs-subtitle">
            Enjoy seamless hospitality with services tailored to your needs.
          </p>
        </div>
      </div>

      <div className="cvs-search">
        <input
          type="text"
          placeholder="Search by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="cvs-filter-bar">
        <div className="cvs-filter-left">
          <i className="fas fa-bell"></i>
          <span>Pending request</span>
        </div>
        <div className="cvs-filter-right">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories?.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="cvs-service-list">
        {paginated.length > 0 ? (
          paginated.map((s) => {
            const category = getCategoryById(s.categoryId);
            return (
              <div
                className="cvs-card"
                key={s.serviceId}
                onClick={() => navigate(`/service-detail?id=${s.serviceId}`)}
              >
                <div className="cvs-card-info">
                  <div className="cvs-card-top">
                    <h3>{s.serviceName}</h3>
                    {category && (
                      <span className="cvs-category">
                        {category.categoryName}
                      </span>
                    )}
                  </div>
                  <p className="cvs-desc">{s.description}</p>
                  <div className="cvs-availability">
                    <span className="cvs-dot"></span> Available
                  </div>
                  <p className="cvs-price">
                    {s.pricePerUnit.toLocaleString()} VND
                  </p>
                </div>
                <div className="cvs-card-img">
                  <img
                    src={
                      s.image
                        ? `http://localhost:8080/upload/service/${s.image}`
                        : "https://picsum.photos/id/237/200/150"
                    }
                    alt={s.serviceName}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="cvs-no-result">Not found any services.</p>
        )}
      </div>

      <div className="cvs-pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={page === i + 1 ? "active" : ""}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {selectedService && (
        <CustomerServiceDetail
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
