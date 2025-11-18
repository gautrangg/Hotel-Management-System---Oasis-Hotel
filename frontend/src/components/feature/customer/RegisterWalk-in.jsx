import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import eye from "../../../assets/icons/eye.png";
import eyeClose from "../../../assets/icons/eye-close.png";
import { validateCustomerRegistration } from '@utils/customerValidator.js';

export default function RegisterWalkIn() {
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    birthDate: "",
    citizenId: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  // UI and status states
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [newlyRegisteredCustomer, setNewlyRegisteredCustomer] = useState(null);

  const navigate = useNavigate();

  // Toggle password visibility
  const togglePassword = () => setShowPassword(!showPassword);

  // Count digits helper
  const digitCount = (s = "") => {
    const m = String(s).match(/\d/g);
    return m ? m.length : 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  // Submit registration form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    const validationErrors = validateCustomerRegistration(formData);

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      setError(firstError);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          citizenId: formData.citizenId,
          password: formData.password,
          address: formData.address,
          gender: formData.gender,
          birthDate: formData.birthDate,
        }),
      });

      if (response.ok) {
        const customerData = await response.json();
        setNewlyRegisteredCustomer(customerData);
        setSuccess("Registration successful!");
        setIsRegistered(true);
        Swal.fire("Success", "Customer registered successfully!", "success");
      } else {
        const err = await response.json();
        setError(err.error || "Registration failed");
        Swal.fire("Error", err.error || "Registration failed", "error");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
      Swal.fire("Error", "Server error. Please try again later.", "error");
    }
  };

  // Continue registering a new customer
  const handleContinue = () => {
    setFormData({
      fullName: "",
      gender: "",
      birthDate: "",
      citizenId: "",
      email: "",
      phone: "",
      address: "",
      password: "",
    });
    setError("");
    setSuccess("");
    setIsRegistered(false);
    setNewlyRegisteredCustomer(null);
  };

  // Navigate to booking page with customer data
  const handleBooking = () => {
    if (newlyRegisteredCustomer) {
      navigate("/staff/booking", { state: { customer: newlyRegisteredCustomer } });
    } else {
      setError("Unable to pass customer data. Please register again.");
      Swal.fire("Error", "Unable to pass customer data. Please register again.", "error");
    }
  };

  // JSX layout
  return (
    <div className="quynh-register-container">
      <form className="quynh-register-form" onSubmit={handleSubmit}>
        {/* Left section: personal information */}
        <div className="quynh-form-section">
          <h4>Personal Information</h4>

          <div className="quynh-form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="quynh-form-group quynh-gender">
            <label>Gender:</label>
            <label>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === "male"}
                onChange={handleChange}
              />
              Male
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === "female"}
                onChange={handleChange}
              />
              Female
            </label>
          </div>

          <div className="quynh-form-group">
            <label>Birth Date</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="quynh-form-group quynh-input-with-counter">
            <label>Citizen ID</label>
            <input
              type="text"
              name="citizenId"
              value={formData.citizenId}
              onChange={handleChange}
              required
              inputMode="numeric"
              maxLength={15}
            />
            <span className="quynh-counter">
              {digitCount(formData.citizenId)}
            </span>
          </div>
        </div>

        <div className="quynh-divider"></div>

        {/* Right section: contact information */}
        <div className="quynh-form-section">
          <h4>Contact</h4>

          <div className="quynh-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="quynh-form-group quynh-input-with-counter">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              inputMode="numeric"
              maxLength={15}
            />
            <span className="quynh-counter">{digitCount(formData.phone)}</span>
          </div>

          <div className="quynh-form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="quynh-form-group quynh-password-wrapper">
            <label>Password</label>
            <div className="quynh-password-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <img
                src={showPassword ? eye : eyeClose}
                alt="Toggle Password"
                className="quynh-eye-icon"
                onClick={togglePassword}
              />
            </div>
          </div>

          {error && !isRegistered && <p className="quynh-error-message">{error}</p>}

          {!isRegistered ? (
            <button type="submit" className="quynh-register-btn">
              Register
            </button>
          ) : (
            <div className="quynh-btn-group">
              <button
                type="button"
                className="quynh-register-btn"
                onClick={handleContinue}
              >
                Continue Register
              </button>
              <button
                type="button"
                className="quynh-booking-btn"
                onClick={handleBooking}
              >
                Booking
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
