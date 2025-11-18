import { useEffect, useState, useCallback } from "react";

/**
 * Hook to fetch the weekly work schedule via API
 * @param {string} startDate - The start date of the week (YYYY-MM-DD)
 * @param {string} endDate - The end date of the week (YYYY-MM-DD)
 */
export default function useSchedule(startDate, endDate) {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchData = useCallback(async () => {
        if (!startDate || !endDate) return;

        try {
            setLoading(true);
            const res = await fetch(
                `http://localhost:8080/api/schedules/week?start=${startDate}&end=${endDate}`,
                {
                    method: "GET",
                    headers: {
                        ...getAuthHeaders(),
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const data = await res.json();
            setSchedules(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch schedule:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { schedules, loading, error, refetch: fetchData, getAuthHeaders };
}