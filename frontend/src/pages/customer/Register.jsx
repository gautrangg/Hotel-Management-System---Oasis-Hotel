import React, { useState } from "react";
import "@assets/style.css";
import { Link, useNavigate } from "react-router-dom";

import eye from "@assets/icons/eye.png";
import eyeClose from "@assets/icons/eye-close.png";
import { validateCustomerRegistration } from '@utils/customerValidator.js';

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    citizenId: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const digitCount = (s = "") => {
    const m = String(s).match(/\d/g);
    return m ? m.length : 0;
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
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
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess("Register successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        const err = await response.json();
        setError(err.error || "Register failed");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="q-register-container">
      {/* Left */}
      <div className="q-register-left">
        <Link to="/" className="t-home-link">
          <i className='bx bxs-home'></i>
          <span>Home</span>
        </Link>
        <h1>Welcome To Oasis Hotel</h1>
        <p>
          Step into a realm of pure elegance and unparalleled service. This
          isn't just a destination — it's a paradise of serenity designed to
          make your dream vacation a reality. From the moment you arrive, you'll
          find yourself in a luxurious sanctuary where every experience is
          unforgettable.
        </p>
      </div>

      {/* Right */}
      <div className="q-register-right">
        <div className="q-register-box">
          <h2>Register</h2>
          <p className="q-sub-text">Create an account</p>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="q-input-wrapper">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <span className="q-counter">
                {digitCount(formData.phone)}/10
              </span>
            </div>

            <div className="q-input-wrapper">
              <input
                type="text"
                name="citizenId"
                placeholder="Citizen ID"
                value={formData.citizenId}
                onChange={handleChange}
                required
              />
              <span className="q-counter">
                {digitCount(formData.citizenId)}/12
              </span>
            </div>

            <div className="q-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <img
                src={showPassword ? eye : eyeClose}
                alt="Toggle Password"
                className="q-eye-icon"
                onClick={togglePassword}
                style={{ cursor: "pointer" }}
              />
            </div>

            <button type="submit" className="q-btn-register">
              Register
            </button>
          </form>

          {error && <p className="q-error-message">{error}</p>}
          {success && <p className="q-success-message">{success}</p>}

          <p className="q-login-text">
            Have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
