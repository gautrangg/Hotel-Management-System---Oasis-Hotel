import React from "react";
import { NavLink } from "react-router-dom";

export default function SidebarItem({ to, icon, label, onClick }) {
  // Nếu có onClick (Logout) → render 1 thẻ <a> styled giống NavLink
  if (onClick) {
    return (
      <a
        href="#"
        className="sidebar-link"
        onClick={(e) => {
          e.preventDefault(); // ngăn reload
          onClick(e);
        }}
      >
        <i className={`bx ${icon}`}></i> {label}
      </a>
    );
  }

  // Các link bình thường
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        "sidebar-link " + (isActive ? "active" : "")
      }
    >
      <i className={`bx ${icon}`}></i> {label}
    </NavLink>
  );
}