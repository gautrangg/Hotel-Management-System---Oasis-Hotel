import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import Swal from 'sweetalert2';

export default function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/staff/login");
      return;
    }

    console.log(token);

    try {
      const payload = jwtDecode.default ? jwtDecode.default(token) : jwtDecode(token);

      setUser({
        staffName: payload.staffName,
        staffId: payload.staffId,
        role: payload.role || null,
        birthDate: payload.birthDate,
        phone: payload.phone,
        email: payload.email,
        staffImage: payload.staffImage
      });

    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
      navigate("/staff/login");
    }
  }, [navigate]);

  const handleLogout = (e) => {
    e.preventDefault();

    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log me out!'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        navigate("/staff/login");
      }
    });
  };
  
  const routes = [
    { path: "/dashboard", label: "Dashboard", icon: "bxs-dashboard", roles: ["ADMIN", "MANAGER"] },
    { path: "/my-schedule", label: "My Schedule", icon: "bx-calendar", roles: ["SERVICE STAFF", "RECEPTIONIST", "HOUSEKEEPER"] },
    { path: "/check-in", label: "Check-in", icon: "bxs-log-in-circle", roles: ["RECEPTIONIST"] },
    { path: "/check-out", label: "Check-out", icon: "bxs-log-out-circle", roles: ["RECEPTIONIST"] },
    { path: "/bookings", label: "Bookings", icon: "bx-book", roles: ["ADMIN", "MANAGER", "RECEPTIONIST"] },
    { path: "/housekeeping", label: "Housekeeping", icon: "bxs-basket", roles: ["HOUSEKEEPER"] },
    { path: "/staffs", label: "Staffs", icon: "bx-user", roles: ["ADMIN", "MANAGER"] },
    { path: "/roomtypes", label: "Room Types", icon: "bx-category", roles: ["ADMIN", "MANAGER"] },
    { path: "/rooms", label: "Rooms", icon: "bx-building", roles: ["ADMIN", "MANAGER"] },
    { path: "/schedules", label: "Schedules", icon: "bx-calendar-alt", roles: ["MANAGER"] },
    { path: "/services", label: "Services", icon: "bx-cart", roles: ["ADMIN", "MANAGER"] },
    { path: "/assigned-services", label: "Assigned Service", icon: "bxs-briefcase", roles: ["SERVICE STAFF"] },
    { path: "/customers", label: "Customers", icon: "bxs-user-circle", roles: ["ADMIN", "MANAGER"] },
    { path: "/register-walk-in", label: "Register Walk-in", icon: "bx-user", roles: ["RECEPTIONIST"] },
    { path: "/rooms-for-book", label: "Rooms", icon: "bxs-bed", roles: ["RECEPTIONIST"] },
    { path: "/request-service", label: "Request Service", icon: "bxs-hand-up", roles: ["RECEPTIONIST"] },
    { path: "/settings", label: "Settings", icon: "bx-cog", roles: ["ADMIN", "MANAGER"] },
  ];

  const accessibleRoutes = routes.filter(route =>
    route.roles.includes(user?.role?.toUpperCase())
  );

  return (
    <aside className="staff-sidebar">
      <div className="profile">
        <img
          src={user?.staffImage
            ? `http://localhost:8080/upload/avatar/${user.staffImage}`
            : "http://localhost:8080/upload/avatar/avatar.png"}
          alt="avatar"
          className="avatar"
        />
        <div>
          <h4>{user?.staffName || "Guest"}</h4>
          <p>{user?.role || "No role"}</p>
        </div>
      </div>

      <div className="sidebar-menu">
        {accessibleRoutes.map((route, idx) => (
          <NavLink
            key={idx}
            to={`/staff${route.path}`}
            end={route.path === "/"} 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className={`bx ${route.icon}`}></i> {route.label}
          </NavLink>
        ))}

        <a onClick={handleLogout} className="logout-btn" href="#">
          <i className="bx bx-log-out"></i> Log out
        </a>
      </div>
    </aside>
  );
}