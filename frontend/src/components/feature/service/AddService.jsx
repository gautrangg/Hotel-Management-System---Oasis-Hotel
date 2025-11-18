import React, { useState, useRef } from "react";
import useServices from "@hooks/useServices";
import "@assets/service/AddService.css";
import useServiceCategories from "@hooks/useServiceCategories";

export default function AddService({ isOpen, onClose, onAdded }) {
  const { addService } = useServices();
  const { categories, loading } = useServiceCategories();
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
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setValues((prev) => ({ ...prev, [name]: checked }));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValues((prev) => ({ ...prev, file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addService(values);

    if (result.success) {
      alert("Đã thêm dịch vụ thành công!");
      onAdded?.(result.data);
      onClose();
    } else {
      setErrors(
        result.errors || { api: result.error || "Không thể thêm dịch vụ" }
      );
    }
  };

  return (
    <div className="hvu-add-service-overlay">
      <div className="hvu-add-service-modal">
        <div className="hvu-modal-header">
          <h2>Add New Service</h2>
          <button className="hvu-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="hvu-form-layout">
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
              onChange={handleFileChange}
            />
            {errors.file && <p className="hvu-error-text">{errors.file}</p>}
          </div>

          {/* Description */}
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
            <button type="button" className="hvu-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="hvu-btn-add">
              Add
            </button>
            {errors.api && <p className="hvu-error-text">{errors.api}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
