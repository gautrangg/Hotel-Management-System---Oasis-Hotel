import { useState, useEffect } from "react";

const API_URL = "http://localhost:8080/api/service-categories";

export default function useServiceCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ================== AUTH HEADER ==================
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ================== FETCH ==================
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================== VALIDATION ==================
  const validateCategory = (data, excludeId = null) => {
    const errors = {};

    if (!data.categoryName || !data.categoryName.trim()) {
      errors.categoryName = "Tên danh mục không được để trống";
    } else if (
      categories.some(
        (c) =>
          c.categoryName.trim().toLowerCase() ===
            data.categoryName.trim().toLowerCase() && c.categoryId !== excludeId
      )
    ) {
      errors.categoryName = "Tên danh mục đã tồn tại";
    }

    if (data.description && data.description.length > 200) {
      errors.description = "Mô tả không được quá 200 ký tự";
    }

    return errors;
  };

  // ================== CREATE ==================
  const addCategory = async (newData) => {
    const errors = validateCategory(newData);
    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    try {
      const formData = new FormData();
      formData.append("categoryName", newData.categoryName);
      if (newData.description)
        formData.append("description", newData.description);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add category");

      const saved = await res.json();
      setCategories((prev) => [...prev, saved]);

      return { success: true, data: saved };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  // ================== UPDATE ==================
  const updateCategory = async (id, updatedData) => {
    const errors = validateCategory(updatedData, id);
    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    try {
      const formData = new FormData();
      formData.append("categoryName", updatedData.categoryName);
      if (updatedData.description)
        formData.append("description", updatedData.description);

      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update category");

      const updated = await res.json();
      setCategories((prev) =>
        prev.map((c) => (c.categoryId === id ? updated : c))
      );

      return { success: true, data: updated };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  // ================== DELETE ==================
  const deleteCategory = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to delete category");

      setCategories((prev) => prev.filter((c) => c.categoryId !== id));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const getCategoryById = (id) =>
    categories.find((c) => c.categoryId === id) || null;

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  };
}
