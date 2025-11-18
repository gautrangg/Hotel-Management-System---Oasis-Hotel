import React, { useState } from "react";
import useServiceCategories from "@hooks/useServiceCategories";
import { X, Trash2, PlusCircle } from "lucide-react";
import "@assets/service/ManageServiceCategories.css";

export default function ManageServiceCategories({ onClose }) {
  const {
    categories,
    addCategory,
    deleteCategory,
    fetchCategories,
    loading,
    error,
  } = useServiceCategories();

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [modalState, setModalState] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
    confirmType: "primary", // 'primary' or 'danger'
  });

  const closeModal = () => {
    setModalState({
      isOpen: false,
      message: "",
      onConfirm: null,
      confirmType: "primary",
    });
  };

  const proceedWithAdd = async (newCategory) => {
    const result = await addCategory(newCategory);
    closeModal(); // Close modal first

    if (!result.success) {
      if (result.errors?.categoryName) alert(result.errors.categoryName);
      else if (result.errors?.description) alert(result.errors.description);
      else alert(result.error || "Không thể thêm danh mục");
      return;
    }

    setNewName("");
    setNewDescription("");
    fetchCategories();
  };

  const proceedWithDelete = async (id) => {
    const result = await deleteCategory(id);
    closeModal(); // Close modal first

    if (result.success) {
      fetchCategories();
    } else {
      alert("Lỗi khi xoá: " + result.error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName) {
      alert("Tên danh mục không được để trống");
      return;
    }
    setModalState({
      isOpen: true,
      message: "Bạn có chắc muốn tạo danh mục này?",
      onConfirm: () =>
        proceedWithAdd({
          categoryName: newName,
          description: newDescription,
        }),
      confirmType: "primary",
    });
  };

  const handleDelete = async (id) => {
    setModalState({
      isOpen: true,
      message: "Bạn có chắc muốn xoá danh mục này?",
      onConfirm: () => proceedWithDelete(id),
      confirmType: "danger",
    });
  };

  return (
    <div className="msc-overlay">
      <div className="msc-modal">
        <div className="msc-header">
          <h2 className="msc-title">Quản lý danh mục dịch vụ</h2>
          <button className="msc-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <p className="msc-loading">Đang tải danh mục...</p>
        ) : error ? (
          <div className="msc-error">
            <p>Lỗi: {error}</p>
            <button onClick={fetchCategories}>Thử lại</button>
          </div>
        ) : (
          <>
            {/* Danh sách category */}
            <div className="msc-list">
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <div className="msc-card" key={cat.categoryId}>
                    <div className="msc-card-info">
                      <h3 className="msc-card-title">{cat.categoryName}</h3>
                      <p className="msc-card-desc">
                        {cat.description || "Không có mô tả"}
                      </p>
                    </div>
                    <button
                      className="msc-delete-btn"
                      title="Xoá danh mục"
                      onClick={() => handleDelete(cat.categoryId)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <p>Chưa có danh mục nào.</p>
              )}
            </div>

            {/* Form thêm category */}
            <form className="msc-add-form" onSubmit={handleAdd}>
              <h3 className="msc-add-title">Add new category</h3>
              <input
                type="text"
                placeholder="Tên danh mục..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="msc-input"
              />
              <textarea
                placeholder="Mô tả (tuỳ chọn)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="msc-textarea"
              />
              <button type="submit" className="msc-add-btn">
                <PlusCircle size={18} />
                <span>Add new category</span>
              </button>
            </form>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {modalState.isOpen && (
        <div className="msc-confirm-overlay">
          <div className="msc-confirm-modal">
            <p className="msc-confirm-message">{modalState.message}</p>
            <div className="msc-confirm-actions">
              <button
                className="msc-confirm-btn msc-confirm-btn-cancel"
                onClick={closeModal}
              >
                Huỷ
              </button>
              <button
                className={`msc-confirm-btn msc-confirm-btn-${modalState.confirmType}`}
                onClick={modalState.onConfirm}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
