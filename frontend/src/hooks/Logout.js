import { useNavigate } from "react-router-dom";

export default function useLogout(type = "staff") {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    if (e) e.preventDefault();

    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    try {
      await fetch(`http://localhost:8080/api/auth/${type}/logout`, {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("role");
      localStorage.removeItem("staffName");
      localStorage.removeItem("userName");

      // điều hướng theo type
      if (type === "staff") {
        console.log("vcl");
        navigate("/staff/login");
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return handleLogout;
}