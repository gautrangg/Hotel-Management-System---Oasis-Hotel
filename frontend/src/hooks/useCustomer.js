import { useState, useEffect } from "react";
import { getAuthHeaders } from "@utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/";

export default function useCustomer() {

    const [customers, setCustomers] = useState([]);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await fetch(API_URL + "customers", {
                credentials: "include",
                headers: getAuthHeaders("application/json"),
            });
            if (!res.ok) throw new Error("Failed to fetch customers");
            setCustomers(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const loginCustomer = async ({ email, password }) => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(API_URL + "auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            let data;
            try {
                data = await res.json();
            } catch {
                throw new Error("Server did not return JSON");
            }

            if (!res.ok) {
                throw new Error(data.error || "Invalid credentials");
            }

            setCurrentCustomer(data);
            localStorage.setItem("customer", JSON.stringify(data));

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };


    const registerCustomer = async ({ name, email, phone, citizenId, password }) => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(API_URL + "auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, citizenId, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Register failed");
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };


    const logoutCustomer = async () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (!confirmLogout) return false;

        try {
            await fetch(API_URL + "auth/logout", {
                method: "POST",
                credentials: "include",
            });
            setCurrentCustomer(null);
            localStorage.removeItem("customer");
            return true;
        } catch (err) {
            setError("Logout failed");
            return false;
        }
    };


    const getCurrentCustomer = async () => {
        try {
            const res = await fetch(API_URL + "auth/me", {
                credentials: "include",
                headers: getAuthHeaders("application/json"),
            });
            if (res.ok) {
                const data = await res.json();
                setCurrentCustomer(data);
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem("customer");
        if (stored && stored !== "undefined") {
            setCurrentCustomer(JSON.parse(stored));
        }
        getCurrentCustomer();
    }, []);

    return {
        customers,
        currentCustomer,
        loading,
        error,
        setError,
        searchTerm,
        setSearchTerm,
        fetchCustomers,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        getCurrentCustomer,
    };

}
