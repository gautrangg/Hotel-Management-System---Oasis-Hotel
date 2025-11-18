import React, { useState } from "react";
import "./AddForm.css";

export default function AddForm({ fields, initialValues, onSubmit, validate }) {
  const [form, setForm] = useState(initialValues || {});
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate ? await validate({ ...form, file }) : {};
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    await onSubmit({ ...form, file }, { resetForm });
  };

  const resetForm = () => {
    setForm(initialValues || {});
    setFile(null);
    setPreview(null);
    setErrors({});
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="add-form-left">
        {fields.map((f) => (
          <div key={f.name} className="add-form-field">
            <p>{f.label}</p>

            {f.type === "file" ? (
              <input type="file" accept={f.accept} onChange={handleFileChange} />
            ) : f.type === "textarea" ? (
              <textarea
                name={f.name}
                value={form[f.name] || ""}
                onChange={handleChange}
                placeholder={f.placeholder}
              />
            ) : (
              <input
                type={f.type}
                name={f.name}
                placeholder={f.placeholder}
                value={form[f.name] || ""}
                onChange={handleChange}
              />
            )}

            {/* Hiện lỗi đỏ ngay bên dưới */}
            {errors[f.name] && (
              <span className="add-form-error-text">{errors[f.name]}</span>
            )}
          </div>
        ))}

        {errors.api && <p className="error-text">{errors.api}</p>}

        <div className="add-form-actions">
          <input type="submit" className="orange-btn" value="Add" />
        </div>
      </div>

      <div className="add-form-right">
        {preview && (
          <img className="preview-image" src={preview} alt="Preview" />
        )}
      </div>
    </form>
  );
}
