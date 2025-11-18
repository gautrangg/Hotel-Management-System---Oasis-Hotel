import React, { useState, useEffect } from "react";
import "@assets/roomtype/RoomType.css";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";
import Pagination from "@components/base/ui/Pagination";
import { useDropzone } from "react-dropzone";

const PAGE_SIZE = 7;
const IMAGE_BASE_URL = "http://localhost:8080/upload/rooms/";
const API_BASE_URL = "http://localhost:8080/api";

const RoomTypeManagement = () => {
  // State management
  const [roomTypes, setRoomTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("id-asc");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [viewingRoom, setViewingRoom] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    roomTypeId: "",
    roomTypeName: "",
    price: "",
    description: "",
    adult: "",
    children: "",
  });

  // Image management states
  const [images, setImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState([]);

  // Utility functions
  const getToken = () => localStorage.getItem("token");

  const truncateText = (text, maxLength = 30) => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  // Sorting logic
  const sortRoomTypes = (list) => {
    const sorted = [...list];
    const sortFunctions = {
      "id-asc": (a, b) => a.roomTypeId - b.roomTypeId,
      "id-desc": (a, b) => b.roomTypeId - a.roomTypeId,
      "name-asc": (a, b) => a.roomTypeName.localeCompare(b.roomTypeName, "vi"),
      "name-desc": (a, b) => b.roomTypeName.localeCompare(a.roomTypeName, "vi"),
      "price-asc": (a, b) => Number(a.price) - Number(b.price),
      "price-desc": (a, b) => Number(b.price) - Number(a.price),
    };

    if (sortFunctions[sortOption]) {
      sorted.sort(sortFunctions[sortOption]);
    }
    return sorted;
  };

  // Pagination calculations
  const sortedRoomTypes = sortRoomTypes(roomTypes);
  const totalPages = Math.ceil(sortedRoomTypes.length / PAGE_SIZE);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const currentRoomTypes = sortedRoomTypes.slice(startIdx, startIdx + PAGE_SIZE);

  // API calls
  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/roomtypes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRoomTypes(data);
    } catch (error) {
      console.error("Error fetching room types:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomImages = async (roomTypeId) => {
    setIsLoadingImages(true);
    try {
      const res = await fetch(`${API_BASE_URL}/roomtypes/${roomTypeId}/full-images`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const imageData = await res.json();
      console.log(imageData);
      setImages(imageData);
    } catch (err) {
      console.error("Failed to fetch images:", err);
      setImages([]);
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Modal handlers
  const closeModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setViewingRoom(null);
    setImages([]);
    setFilesToUpload([]);
    setFormData({
      roomTypeId: "",
      roomTypeName: "",
      price: "",
      description: "",
    });
  };

  const openAddModal = () => {
    const nextId =
      roomTypes.length > 0
        ? Math.max(...roomTypes.map((room) => room.roomTypeId)) + 1
        : 1;
    setEditingRoom(null);
    setViewingRoom(null);
    setFormData({
      roomTypeId: nextId,
      roomTypeName: "",
      price: "",
      description: "",
      adult: "",
      children: "",
    });
    setImages([]);
    setFilesToUpload([]);
    setShowModal(true);
  };

  const openEditModal = async (room) => {
    setEditingRoom(room);
    setViewingRoom(null);
    setFormData({ ...room, price: room.price || "", adult: room.adult || "", children: room.children || "" });
    setShowModal(true);
    await fetchRoomImages(room.roomTypeId);
  };

  const openViewModal = async (room) => {
    setViewingRoom(room);
    setEditingRoom(null);
    setFormData({ ...room, price: room.price || "", adult: room.adult || "", children: room.children || "" });
    setShowModal(true);
    await fetchRoomImages(room.roomTypeId);
  };

  const handleDelete = (room) => {
    setDeletingRoom(room);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingRoom) return;

    try {
      await fetch(`${API_BASE_URL}/roomtypes/${deletingRoom.roomTypeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      await fetchRoomTypes();
      setShowDeleteModal(false);
      setDeletingRoom(null);

      // Adjust current page if needed
      if (currentRoomTypes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete room type");
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isNew = !editingRoom && !viewingRoom;
    let savedRoomType = null;

    try {
      const url = isNew
        ? `${API_BASE_URL}/roomtypes`
        : `${API_BASE_URL}/roomtypes/${editingRoom.roomTypeId}`;
      const method = isNew ? "POST" : "PUT";

      const dataToSend = {
        roomTypeName: formData.roomTypeName,
        price: formData.price,
        description: formData.description,
        adult: formData.adult,
        children: formData.children,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) throw new Error("Failed to save room type info");
      savedRoomType = await res.json();

      // Upload new images if any
      if (filesToUpload.length > 0) {
        const uploadPromises = filesToUpload.map((file) => {
          const formData = new FormData();
          formData.append("file", file);
          return fetch(
            `${API_BASE_URL}/roomtypes/${savedRoomType.roomTypeId}/images`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${getToken()}` },
              body: formData,
            }
          );
        });
        await Promise.all(uploadPromises);
      }

      closeModal();
      await fetchRoomTypes();
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save room type");
    }
  };

  const handleImageDelete = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      await fetch(`${API_BASE_URL}/images/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setImages(images.filter((img) => img.roomImageId !== imageId));
    } catch (err) {
      console.error("Failed to delete image:", err);
      alert("Failed to delete image");
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  // Image uploader component
  const ImageUploader = () => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: { "image/jpeg": [], "image/png": [], "image/jpg": [] },
      onDrop: (acceptedFiles) =>
        setFilesToUpload((prev) => [...prev, ...acceptedFiles]),
    });

    return (
      <div>
        <div {...getRootProps({ className: "c-dropzone" })}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop files here...</p>
          ) : (
            <p>Drag 'n' drop files here, or click to select</p>
          )}
        </div>
        {filesToUpload.length > 0 && (
          <div className="c-preview-container">
            {filesToUpload.map((file, index) => (
              <div key={index} className="c-preview-item">
                <img src={URL.createObjectURL(file)} alt="Preview" />
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFilesToUpload(filesToUpload.filter((_, i) => i !== index))
                  }
                  className="c-delete-img-btn"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="c-roomtype-wrapper">
        <Header />
        <Sidebar />
        <div className="staff-main-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="c-roomtype-wrapper">
      <Header />
      <Sidebar />
      <div className="staff-main-content">
        <div className="c-sidebar-placeholder">
          <h2 className="c-roomtype-title">
            <i className="fas fa-bed"></i> Room Type Management
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button className="c-add-btn" onClick={openAddModal}>
              <i className="fas fa-plus"></i> Add Room Type
            </button>
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="c-sort-select"
            >
              <option value="id-asc">🔢 ID ↑</option>
              <option value="id-desc">🔢 ID ↓</option>
              <option value="name-asc">📝 Name A–Z</option>
              <option value="name-desc">📝 Name Z–A</option>
              <option value="price-asc">💰 Price ↑</option>
              <option value="price-desc">💰 Price ↓</option>
            </select>
          </div>
        </div>

        <div className="c-table-container">
          <table className="c-roomtype-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Room Type Name</th>
                <th>Price</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRoomTypes.length > 0 ? (
                currentRoomTypes.map((room) => (
                  <tr key={room.roomTypeId}>
                    <td>{room.roomTypeId}</td>
                    <td>{room.roomTypeName}</td>
                    <td>
                      {new Intl.NumberFormat("vi-VN").format(room.price)} VNĐ
                    </td>
                    <td>{truncateText(room.description)}</td>
                    <td className="c-action-btns">
                      <button onClick={() => openViewModal(room)}>
                        <i className="fas fa-eye"></i> View
                      </button>
                      <button onClick={() => openEditModal(room)}>
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button onClick={() => handleDelete(room)}>
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No room types found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Modal for Add/Edit/View */}
      {showModal && (
        <div className="c-modal-overlay">
          <div className="c-modal c-modal-large">
            <h3>
              {viewingRoom
                ? `View: ${formData.roomTypeName}`
                : editingRoom
                  ? `Edit: ${formData.roomTypeName}`
                  : "Add New Room Type"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="c-modal-content-layout">
                {/* Left side - Image Management */}
                <div className="c-modal-left">
                  <h4>
                    <i className="fas fa-images"></i> Images
                  </h4>

                  {/* Upload New Images */}
                  {!viewingRoom && (
                    <div className="c-upload-section">
                      <ImageUploader />
                    </div>
                  )}

                  {/* Existing Images Gallery */}
                  <div className="c-existing-images">
                    <h5>Existing Images</h5>
                    {isLoadingImages ? (
                      <p>Loading images...</p>
                    ) : (
                      <div className="c-image-gallery">
                        {images.length > 0 ? (
                          images.map((roomImage, index) => (
                            <div key={index} className="c-gallery-item">
                              <img
                                src={`${IMAGE_BASE_URL}${roomImage.image}`}
                                alt={roomImage}
                              />
                              {!viewingRoom && (
                                <button
                                  type="button"
                                  className="c-delete-img-btn"
                                  onClick={() => handleImageDelete(roomImage.roomImageId)}
                                >
                                  &times;
                                </button>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="c-no-images">No images found.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - Form Information */}
                <div className="c-modal-right">
                  <h4>
                    <i className="fas fa-info-circle"></i> Room Type Information
                  </h4>

                  <div className="c-form-group">
                    <label>ID</label>
                    <input type="text" value={formData.roomTypeId} readOnly />
                  </div>

                  <div className="c-form-group">
                    <label>Room Type Name *</label>
                    <input
                      type="text"
                      value={formData.roomTypeName}
                      onChange={(e) =>
                        setFormData({ ...formData, roomTypeName: e.target.value })
                      }
                      required
                      readOnly={!!viewingRoom}
                      placeholder="Enter room type name"
                    />
                  </div>

                  <div className="c-form-group">
                    <label>Price (VNĐ) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                      min="0"
                      readOnly={!!viewingRoom}
                      placeholder="Enter price"
                    />
                  </div>

                  <div className="c-form-group">
                    <label>Adults *</label>
                    <input
                      type="number"
                      value={formData.adult}
                      onChange={(e) =>
                        setFormData({ ...formData, adult: e.target.value })
                      }
                      required
                      min="1"
                      readOnly={!!viewingRoom}
                      placeholder="Enter number of adults"
                    />
                  </div>

                  <div className="c-form-group">
                    <label>Children</label>
                    <input
                      type="number"
                      value={formData.children}
                      onChange={(e) =>
                        setFormData({ ...formData, children: e.target.value })
                      }
                      min="0"
                      readOnly={!!viewingRoom}
                      placeholder="Enter number of children"
                    />
                  </div>

                  <div className="c-form-group">
                    <label>Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                      readOnly={!!viewingRoom}
                      placeholder="Enter description"
                      rows="6"
                    />
                  </div>
                </div>
              </div>

              <div className="c-modal-actions">
                {!viewingRoom && (
                  <button type="submit" className="c-save-btn">
                    <i className={`fas ${editingRoom ? "fa-save" : "fa-plus-circle"}`}></i>{" "}
                    {editingRoom ? "Save Changes" : "Add Room Type"}
                  </button>
                )}
                <button
                  type="button"
                  className="c-cancel-btn"
                  onClick={closeModal}
                >
                  <i className={`fas ${viewingRoom ? "fa-times" : "fa-ban"}`}></i>{" "}
                  {viewingRoom ? "Close" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="c-modal-overlay">
          <div className="c-modal" style={{ maxWidth: "450px" }}>
            <h3>
              <i className="fas fa-exclamation-triangle" style={{ color: "#ef4444" }}></i>{" "}
              Confirm Delete
            </h3>
            <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}>
              Are you sure you want to delete <strong>"{deletingRoom?.roomTypeName}"</strong>?
              <br />
              This action cannot be undone.
            </p>
            <div className="c-modal-actions">
              <button
                type="button"
                className="c-save-btn"
                onClick={confirmDelete}
                style={{ backgroundColor: "#ef4444" }}
              >
                <i className="fas fa-trash"></i> Delete
              </button>
              <button
                type="button"
                className="c-cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomTypeManagement;