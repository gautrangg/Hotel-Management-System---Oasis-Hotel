import React, { useState, useRef, useEffect } from "react";
import useServices from "@hooks/useServices";
import useServiceCategories from "@hooks/useServiceCategories";
import "@assets/service/AddService.css";

export default function EditServiceForm({
  isOpen,
  item,
  onClose,
  onUpdated,
  onDeleted,
}) {
  const { updateService, removeService } = useServices();
  const { categories, loading } = useServiceCategories();
  const fileInputRef = useRef(null);

  const [values, setValues] = useState({
    serviceName: "",
    pricePerUnit: "",
    categoryId: "",
    unit: "",
    description: "",
    needStaff: false,
    isActive: true,
    file: null,
    availableStartTime: "",
    availableEndTime: "",
  });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);

  useEffect(() => {
    if (item) {
      setValues({
        serviceName: item.serviceName || "",
        pricePerUnit: item.pricePerUnit || "",
        categoryId: item.categoryId || "",
        unit: item.unit || "",
        description: item.description || "",
        needStaff: item.needStaff || false,
        isActive: item.isActive ?? true,
        file: null,
        availableStartTime: item.availableStartTime || "",
        availableEndTime: item.availableEndTime || "",
      });
      setPreview(
        item.image ? `http://localhost:8080/upload/service/${item.image}` : null
      );
      setErrors({});
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setValues((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file" && files?.[0]) {
      setValues((prev) => ({ ...prev, file: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const handleUpdateClick = () => {
    setShowConfirmUpdate(true);
  };

  const handleConfirmUpdate = async () => {
    setShowConfirmUpdate(false);
    const result = await updateService(item.serviceId, values);
    if (result.success) {
      onUpdated?.(result.data);
      onClose();
    } else {
      setErrors(
        result.errors || { api: result.error || "Không thể cập nhật dịch vụ" }
      );
    }
  };

  const handleCancelUpdate = () => {
    setShowConfirmUpdate(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa dịch vụ này?");
    if (!confirmed) return;

    const success = await removeService(item.serviceId);
    if (success) {
      onDeleted?.(item.serviceId);
      onClose();
    }
  };

  return (
    <div className="hvu-add-service-overlay">
      <div className="hvu-add-service-modal">
        <div className="hvu-modal-header">
          <h2>Edit Service</h2>
          <button className="hvu-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="hvu-form-layout">
          {/* Left column */}
          <div className="hvu-form-left">
            <div className="hvu-form-group">
              <label>Service Name*</label>
              <input
                type="text"
                name="serviceName"
                value={values.serviceName}
                onChange={handleChange}
              />
              {errors.serviceName && (
                <p className="hvu-error-text">{errors.serviceName}</p>
              )}
            </div>

            <div className="hvu-form-group">
              <label>Price Per Unit*</label>
              <input
                type="number"
                name="pricePerUnit"
                value={values.pricePerUnit}
                onChange={handleChange}
              />
              {errors.pricePerUnit && (
                <p className="hvu-error-text">{errors.pricePerUnit}</p>
              )}
            </div>

            <div className="hvu-form-group">
              <label>Category*</label>
              <select
                name="categoryId"
                value={values.categoryId}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                {loading ? (
                  <option value="">Loading...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))
                )}
              </select>
              {errors.categoryId && (
                <p className="hvu-error-text">{errors.categoryId}</p>
              )}
            </div>

            <div className="hvu-form-group">
              <label>Unit</label>
              <input
                type="text"
                name="unit"
                value={values.unit}
                onChange={handleChange}
              />
              {errors.unit && <p className="hvu-error-text">{errors.unit}</p>}
            </div>

            <div className="hvu-form-group">
              <label>Available Start Time</label>
              <input
                type="time"
                name="availableStartTime"
                value={values.availableStartTime}
                onChange={handleChange}
              />
              {errors.availableStartTime && (
                <p className="hvu-error-text">{errors.availableStartTime}</p>
              )}
            </div>

            <div className="hvu-form-group">
              <label>Available End Time</label>
              <input
                type="time"
                name="availableEndTime"
                value={values.availableEndTime}
                onChange={handleChange}
              />
              {errors.availableEndTime && (
                <p className="hvu-error-text">{errors.availableEndTime}</p>
              )}
            </div>

            {/* <div className="hvu-form-group-checkbox">
              <label>
                <input
                  type="checkbox"
                  name="needStaff"
                  checked={values.needStaff}
                  onChange={handleChange}
                />
                Need Staff
              </label>
            </div> */}
          </div>

          {/* Right column - image */}
          <div className="hvu-form-right">
            <label>Preview Image</label>
            <div
              className="hvu-image-upload-box"
              onClick={handleImageClick}
              style={{ backgroundImage: preview ? `url(${preview})` : "none" }}
            >
              {!preview && <span>Click to upload image</span>}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleChange}
            />
            {errors.file && <p className="hvu-error-text">{errors.file}</p>}
          </div>

          {/* Description full width */}
          <div className="hvu-description-full">
            <label>Description</label>
            <textarea
              name="description"
              value={values.description}
              onChange={handleChange}
            />
            {errors.description && (
              <p className="hvu-error-text">{errors.description}</p>
            )}
          </div>

          {/* Footer */}
          <div className="hvu-form-footer">
            <button type="button" className="hvu-del-btn" onClick={handleDelete}>
              Delete
            </button>
            <button type="button" className="re-orange-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="hvu-btn-add"
              onClick={handleUpdateClick}
            >
              Update
            </button>
            {errors.api && <p className="hvu-error-text">{errors.api}</p>}
          </div>
        </div>

        {/* Confirmation Popup */}
        {showConfirmUpdate && (
          <div className="hvu-confirm-overlay">
            <div className="hvu-confirm-dialog">
              <div className="hvu-confirm-header">
                <h3>Xác nhận cập nhật</h3>
              </div>
              <div className="hvu-confirm-body">
                <p>Bạn có chắc chắn muốn cập nhật dịch vụ này không?</p>
              </div>
              <div className="hvu-confirm-footer">
                <button
                  type="button"
                  className="hvu-confirm-cancel-btn"
                  onClick={handleCancelUpdate}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="hvu-confirm-ok-btn"
                  onClick={handleConfirmUpdate}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
