import React, { useState, useEffect } from 'react';
import "@assets/customer/EditCustomerModal.css";

export default function EditCustomerModal({ isOpen, onClose, onSuccess, customer }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    citizenId: '',
    address: '',
    avatarUrl: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: customer.fullName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        birthDate: customer.birthDate || '',
        gender: customer.gender || 'Male',
        citizenId: customer.citizenId || '',
        address: customer.address || '',
        avatarUrl: customer.avatarUrl || ''
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/customers/${customer.customerId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const result = await response.json();
      onSuccess(result);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="vm-modal-overlay">
      <div className="vm-modal-content">
        <h2 className="vm-modal-title">Edit Customer</h2>
        {error && <div className="vm-error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="vm-form">
          <div className="vm-form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="vm-input"
            />
          </div>

          <div className="vm-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="vm-input"
            />
          </div>

          <div className="vm-form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="vm-input"
            />
          </div>

          <div className="vm-form-group">
            <label>Birth Date</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="vm-input"
            />
          </div>

          <div className="vm-form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="vm-select"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="vm-form-group">
            <label>Citizen ID</label>
            <input
              type="text"
              name="citizenId"
              value={formData.citizenId}
              onChange={handleChange}
              className="vm-input"
            />
          </div>

          <div className="vm-form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="vm-input"
            />
          </div>

          <div className="vm-form-group">
            <label>Avatar URL</label>
            <input
              type="text"
              name="avatarUrl"
              value={formData.avatarUrl}
              onChange={handleChange}
              className="vm-input"
            />
          </div>

          <div className="vm-form-actions">
            <button type="submit" className="vm-submit-btn">Save Changes</button>
            <button type="button" onClick={onClose} className="vm-cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}