import React, { useState } from "react";
import "@assets/style.css";
import { useNavigate, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";

const API_URL = "http://localhost:8080/api/";

export default function StaffLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const res = await fetch(API_URL + "auth/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      localStorage.setItem("token", data.token);

      
      const payload = jwt_decode(data.token);
      const role = payload.role.toLowerCase();

      if (role.toLowerCase() === "manager" || role.toLowerCase() === "admin") {
        navigate("/staff/dashboard");
      } else if (
        role.toLowerCase() === "receptionist" ||
        role.toLowerCase() === "housekeeper" ||
        role.toLowerCase() === "service staff"
      ) {
        navigate("/staff/my-schedule");
      } else {
        navigate("/staff/login");
      }

    } catch (err) {
      console.error(err);
      setErrorMessage("Email or Password is incorrect!");
    }
  };


  return (
    <div className="t-login-container">
      <div className="t-login-card">
        <Link to="/" className="t-home-link">
          <i className='bx bxs-home'></i>
          <span>Home</span>
        </Link>
        <div
          className="t-login-left"
          style={{
            backgroundImage:
              "url('/desk.jpg')",
          }}
        >
          <div className="t-overlay"></div>
        </div>

        <div className="t-login-right">
          <img className="t-login-logo" src="/logo2.png" alt="logo" />
          <h2>Oasis Hotel - Staff</h2>
          <h1>Sign In</h1>
          <form onSubmit={handleStaffLogin}>

            <div className="t-form-group">
              <label>Email Address</label>
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="t-form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="t-form-bottom">
              {errorMessage && <p className="t-error-text">{errorMessage}</p>}
            </div>

            <button className="t-button t-login-button" type="submit">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
}
