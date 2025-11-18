import { useState, useEffect, useMemo } from "react";

const API_URL = "http://localhost:8080/api/services";

export default function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // === JWT Header helper ===
  const _getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ================== FETCH ==================
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, { headers: _getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setServices(data);
    } catch (err) {
      setError(err.message);
      window.confirm(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ================== DUPLICATE CHECK ==================
  const checkDuplicate = (serviceName, excludeId = null) =>
    services.some(
      (s) =>
        s.serviceName.toLowerCase() === serviceName.trim().toLowerCase() &&
        s.serviceId !== excludeId &&
        s.isActive === true
    );

  // ================== VALIDATION ==================
  const validateService = (data, excludeId = null) => {
    const errors = {};

    if (!data.serviceName || data.serviceName.trim() === "") {
      errors.serviceName = "Service name is required";
    } else if (data.serviceName.length > 255) {
      errors.serviceName = "Service name must not exceed 255 characters";
    } else if (checkDuplicate(data.serviceName, excludeId)) {
      errors.serviceName = "Service name already exists";
    }

    if (!data.categoryId || isNaN(data.categoryId)) {
      errors.categoryId = "Category is required";
    }

    if (
      data.pricePerUnit == null ||
      isNaN(data.pricePerUnit) ||
      Number(data.pricePerUnit) < 0 ||
      Number(data.pricePerUnit > 150000000)
    ) {
      errors.pricePerUnit =
        "Price per unit must be a positive number and < 150.000.000";
    }

    if (data.unit && data.unit.length > 50) {
      errors.unit = "Unit must not exceed 50 characters";
    }

    if (data.description && data.description.length > 2000) {
      errors.description = "Description is too long";
    }

    // Validate time fields
    if (data.availableStartTime && data.availableEndTime) {
      if (data.availableStartTime >= data.availableEndTime) {
        errors.availableEndTime = "End time must be after start time";
      }
    }

    if (data.file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(data.file.type)) {
        errors.file = "Only JPG and PNG files are allowed";
      }
      if (data.file.size > 2 * 1024 * 1024) {
        errors.file = "File size must not exceed 2MB";
      }
    }

    return errors;
  };

  // ================== CREATE ==================
  const addService = async (newData) => {
    const errors = validateService(newData);
    if (Object.keys(errors).length > 0) return { success: false, errors };

    try {
      const formData = new FormData();
      formData.append("categoryId", newData.categoryId);
      formData.append("serviceName", newData.serviceName);
      formData.append("pricePerUnit", newData.pricePerUnit);
      if (newData.unit) formData.append("unit", newData.unit);
      if (newData.description)
        formData.append("description", newData.description);
      formData.append("needStaff", newData.needStaff ?? true);
      formData.append("isActive", true);
      if (newData.file) formData.append("file", newData.file);
      if (newData.availableStartTime)
        formData.append("availableStartTime", newData.availableStartTime);
      if (newData.availableEndTime)
        formData.append("availableEndTime", newData.availableEndTime);
      

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: _getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to add service");
      const saved = await res.json();
      setServices((prev) => [...prev, saved]);
      return { success: true, data: saved };
    } catch (err) {
      window.confirm(`Error: ${err.message}`);
      return { success: false, error: err.message };
    }
  };

  // ================== UPDATE ==================
  const updateService = async (id, updatedData) => {
    const errors = validateService(updatedData, id);
    if (Object.keys(errors).length > 0) return { success: false, errors };

    try {
      const formData = new FormData();
      formData.append("categoryId", updatedData.categoryId);
      formData.append("serviceName", updatedData.serviceName);
      formData.append("pricePerUnit", updatedData.pricePerUnit);
      if (updatedData.unit) formData.append("unit", updatedData.unit);
      if (updatedData.description)
        formData.append("description", updatedData.description);
      formData.append("needStaff", updatedData.needStaff ?? false);
      formData.append("isActive", true);
      if (updatedData.file) formData.append("file", updatedData.file);
      if (updatedData.availableStartTime)
        formData.append("availableStartTime", updatedData.availableStartTime);
      if (updatedData.availableEndTime)
        formData.append("availableEndTime", updatedData.availableEndTime);

      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        body: formData,
        headers: _getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to update service");

      const updated = await res.json();
      setServices((prev) =>
        prev.map((s) => (s.serviceId === id ? updated : s))
      );

      return { success: true, data: updated };
    } catch (err) {
      window.confirm(`Error: ${err.message}`);
      return { success: false, error: err.message };
    }
  };

  // ================== DELETE ==================
  const removeService = async (id) => {
    try {
      // Tìm service hiện tại để lấy những field cần thiết
      const service = services.find((s) => s.serviceId === id);
      if (!service) throw new Error("Service not found");

      const formData = new FormData();
      formData.append("serviceName", service.serviceName);
      formData.append("pricePerUnit", service.pricePerUnit);
      formData.append("categoryId", service.categoryId);
      formData.append("unit", service.unit || "");
      formData.append("description", service.description || "");
      formData.append("needStaff", service.needStaff ?? false);
      formData.append("isActive", false); // ⌀ chỉ tắt service
      if (service.file) formData.append("file", service.file);
      if (service.availableStartTime)
        formData.append("availableStartTime", service.availableStartTime);
      if (service.availableEndTime)
        formData.append("availableEndTime", service.availableEndTime);

      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: _getAuthHeaders(), // KHÔNG set Content-Type
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to remove service");

      const updated = await res.json();

      // Cập nhật state ngay
      setServices((prev) =>
        prev.map((s) => (s.serviceId === id ? updated : s))
      );

      alert("Dịch vụ đã được tạm ẩn thành công!");
      return { success: true, data: updated };
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
      return { success: false, error: err.message };
    }
  };

  const removeServicePermanently = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: _getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to permanently delete service");

      setServices((prev) => prev.filter((s) => s.serviceId !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ================== SORT ==================
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedServices = useMemo(() => {
    if (!sortConfig.key) return services;
    return [...services].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });
  }, [services, sortConfig]);

  const getAllServices = async () => {
    const res = await axios.get(BASE_URL);
    return res.data;
  };

  const searchServices = async (keyword) => {
    const res = await axios.get(`${BASE_URL}?q=${keyword}`);
    return res.data;
  };

  return {
    services: sortedServices,
    loading,
    error,
    fetchServices,
    addService,
    updateService,
    removeService,
    checkDuplicate,
    sortConfig,
    handleSort,
    validateService,
    getAllServices,
    searchServices,
    removeServicePermanently,
  };
}
