// ViewCustomer.jsx
import React, { useEffect, useState } from "react";
import useCustomer from "@hooks/useCustomer";
import { Pencil, Mail, Phone, Calendar, MapPin, User } from "lucide-react";
import CreateCustomerModal from "./CreateCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import "@assets/customer/ViewCustomer.css";

export default function ViewCustomer() {
  const { customers, loading, error, fetchCustomers } = useCustomer();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("fullName");
  const [page, setPage] = useState(1);
  const [genderFilter, setGenderFilter] = useState("All");
  const [ageFilter, setAgeFilter] = useState({ min: "", max: "" });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const itemsPerPage = 16;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    // Tính toán tuổi (nếu có ngày sinh)
    const age = c.birthDate
      ? Math.floor(
          (new Date() - new Date(c.birthDate)) / (365.25 * 24 * 60 * 60 * 1000)
        )
      : null;

    // Kiểm tra điều kiện search (tên, email, sđt, địa chỉ)
    const matchesSearch =
      (c.fullName &&
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()));

    // Kiểm tra filter giới tính
    const matchesGender =
      genderFilter === "All" ||
      (c.gender && c.gender.toLowerCase() === genderFilter.toLowerCase());

    // Kiểm tra khoảng tuổi
    const matchesAge =
      (!ageFilter.min || (age !== null && age >= Number(ageFilter.min))) &&
      (!ageFilter.max || (age !== null && age <= Number(ageFilter.max)));

    return matchesSearch && matchesGender && matchesAge;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!a[sortKey]) return 1;
    if (!b[sortKey]) return -1;
    return a[sortKey].toString().localeCompare(b[sortKey].toString());
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const pagedCustomers = sorted.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="vm-error-text">{error}</p>;
  if (customers.length === 0) return <p>No customers found.</p>;

  return (
    <div className="vm-container">
      <h1 className="vm-title">Customer ({customers.length})</h1>

      <div className="vm-filter-bar">
        <select
          value={genderFilter}
          onChange={(e) => {
            setGenderFilter(e.target.value);
            setPage(1);
          }}
          className="vm-select"
        >
          <option value="All">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input
          type="number"
          placeholder="Min Age"
          value={ageFilter.min}
          onChange={(e) => {
            setAgeFilter({ ...ageFilter, min: e.target.value });
            setPage(1);
          }}
          className="vm-input"
        />
        <input
          type="number"
          placeholder="Max Age"
          value={ageFilter.max}
          onChange={(e) => {
            setAgeFilter({ ...ageFilter, max: e.target.value });
            setPage(1);
          }}
          className="vm-input"
        />

        <div className="vm-search-group">
          <input
            type="text"
            placeholder="Search by Name, Email or Phone"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="vm-search"
          />
          <button className="vm-add-button" onClick={() => setIsCreateModalOpen(true)}>+ Add New</button>
        </div>
      </div>

      <div className="vm-card-container">
        {pagedCustomers.map((customer) => (
          <div key={customer.customerId} className="vm-card">
            <div className="vm-avatar-section">
              <img
                src={
                  customer.avatarUrl ||
                  "http://localhost:8080/upload/avatar/avatar.png"
                }
                alt="avatar"
                className="vm-avatar"
              />
            </div>
            <div className="vm-info">
              <div className="vm-header">
                <h3 className="vm-name">{customer.fullName}</h3>
                <button 
                  className="vm-edit"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setIsEditModalOpen(true);
                  }}
                >
                  <Pencil size={16} />
                </button>
              </div>
              <p className="vm-field vm-gender">
                <User size={14} className="vm-icon" />
                {customer.gender || "N/A"}
              </p>
              <p className="vm-field">
                <Mail size={14} className="vm-icon" />
                {customer.email}
              </p>
              <p className="vm-field">
                <Phone size={14} className="vm-icon" />
                {customer.phone || "N/A"}
              </p>
              <p className="vm-field">
                <Calendar size={14} className="vm-icon" />
                {customer.birthDate || "N/A"}
              </p>
              <p className="vm-field">
                <MapPin size={14} className="vm-icon" />
                {customer.address || "N/A"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="vm-pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`vm-page-btn ${page === i + 1 ? "active" : ""}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <CreateCustomerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newCustomer) => {
          fetchCustomers();
        }}
      />

      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={selectedCustomer}
        onSuccess={(updatedCustomer) => {
          fetchCustomers();
        }}
      />
    </div>
  );
}
