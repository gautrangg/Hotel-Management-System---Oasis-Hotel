import React, { useState } from "react";
import "@assets/style.css";
import { Link, useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Login success:", data);

        localStorage.setItem("token", data.token);

        try {
          const decode = jwtDecode(data.token);

          const customerId = decode.id;
          const customerName = decode.name;

          if (customerId) {
            localStorage.setItem("customerId", customerId);
            localStorage.setItem("customerName", customerName || "");
            console.log("Saved customerId:", customerId);
          }
        } catch (decodeError) {
          console.error("Failed to decode token:", decodeError);
        }

        navigate("/home");
      } else {
        setError(data.error || "Login failed!");
      }
    } catch (err) {
      console.log(err);
      setError("Server error, please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="q-login-container">
      <div className="q-login-left">
        <Link to="/" className="t-home-link">
          <i className='bx bxs-home'></i>
          <span>Home</span>
        </Link>
        <h1>Welcome To Oasis Hotel</h1>
        <p>
          Step into a realm of pure elegance and unparalleled service.
          This isn't just a destination, it's a paradise of serenity designed to make your dream vacation a reality.
          From the moment you arrive, you'll find yourself in a luxurious sanctuary, where every experience is unforgettable.
        </p>
      </div>
      <div className="q-login-right">
        <div className="q-login-box">
          <h2>Login</h2>
          <p className="q-sub-text">Login into your pages account</p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="q-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i
                className={`bx ${showPassword ? 'bx-show' : 'bx-hide'} q-eye-icon`}
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}
              />
            </div>

            <button type="submit" className="q-btn-login" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}


          <p className="q-register-text">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
