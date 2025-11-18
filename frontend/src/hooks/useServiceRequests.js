import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/service-requests";

export default function useServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const _getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, { headers: _getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch service requests");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestDetails = async () => {
    try {
      const res = await fetch(API_URL + "/details", {headers: _getAuthHeaders()});
      if(!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data;
    }
    catch(e) {
      setError(e.message);
    }
  }

  const getStatusByServiceId = (serviceId) => {
    const req = requests.find((r) => r.serviceId === serviceId);
    return req ? req.status : "Unknown";
  };

  // === addRequest với FormData ===
  const addRequest = async (service, extraData = {}) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("serviceId", service.serviceId);
      formData.append("quantity", 1);
      formData.append("requestTime", new Date().toISOString());
      formData.append("status", "Pending");

      // Thêm các dữ liệu khác nếu cần
      Object.keys(extraData).forEach((key) => {
        formData.append(key, extraData[key]);
      });

      const res = await fetch(API_URL, {
        method: "POST",
        headers: _getAuthHeaders(), // không set Content-Type, fetch tự set multipart/form-data
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add service request");
      const newRequest = await res.json();
      setRequests((prev) => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { requests, loading, error, getStatusByServiceId, fetchRequests, addRequest, fetchRequestDetails };
}
