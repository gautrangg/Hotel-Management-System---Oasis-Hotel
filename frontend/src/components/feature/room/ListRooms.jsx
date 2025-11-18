import React from "react";
import useRooms from "@hooks/useRooms";
import RoomForm from "./RoomForm";
import Pagination from "@components/base/ui/Pagination";
import "@assets/room/RoomManagement.css";

export default function ListRooms() {
  const {
    paginatedRooms,
    totalRooms,
    roomTypes,
    currentPage,
    setCurrentPage,
    recordsPerPage,
    setRecordsPerPage,
    filters,
    handleFilterChange,
    sortConfig,
    requestSort,
    isPanelOpen,
    panelMode,
    currentRoom,
    openPanel,
    closePanel,
    handleSaveRoom,
    handleDeleteRoom,
  } = useRooms();

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return " ↕";
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };

  return (
    <div className="room-management-container">
      <div className="room-management-header">
        <h1>Room Management</h1>
        <button onClick={() => openPanel('add')} className="t-orange-btn">
          <i className="fas fa-plus"></i> Add Room
        </button>
      </div>

      <div className="room-filter-bar">
        <select 
          name="type" 
          value={filters.type} 
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="all">All Types</option>
          {roomTypes.map(rt => (
            <option key={rt.roomTypeId} value={rt.roomTypeName}>
              {rt.roomTypeName}
            </option>
          ))}
        </select>

        <select 
          name="price" 
          value={filters.price} 
          onChange={(e) => handleFilterChange('price', e.target.value)}
        >
          <option value="all">All Prices</option>
          <option value="0-2000000">Under 2,000,000</option>
          <option value="2000000-5000000">2,000,000 - 5,000,000</option>
          <option value="5000000-10000000">5,000,000 - 10,000,000</option>
          <option value="10000000-">Over 10,000,000</option>
        </select>

        <select 
          name="floor" 
          value={filters.floor} 
          onChange={(e) => handleFilterChange('floor', e.target.value)}
        >
          <option value="all">All Floors</option>
          <option value="1-3">Floor 1-3</option>
          <option value="4-6">Floor 4-6</option>
          <option value="7-10">Floor 7-10</option>
          <option value="11-">Over Floor 10</option>
        </select>

        <select 
          name="status" 
          value={filters.status} 
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>

      <div className="room-table-container">
        <table className="room-management-table">
          <thead>
            <tr>
              <th onClick={() => requestSort("id")}>
                ID<span className="sort-indicator">{getSortIndicator("id")}</span>
              </th>
              <th onClick={() => requestSort("roomNumber")}>
                Number<span className="sort-indicator">{getSortIndicator("roomNumber")}</span>
              </th>
              <th onClick={() => requestSort("type")}>
                Type<span className="sort-indicator">{getSortIndicator("type")}</span>
              </th>
              <th onClick={() => requestSort("price")}>
                Price<span className="sort-indicator">{getSortIndicator("price")}</span>
              </th>
              <th onClick={() => requestSort("floor")}>
                Floor<span className="sort-indicator">{getSortIndicator("floor")}</span>
              </th>
              <th onClick={() => requestSort("status")}>
                Status<span className="sort-indicator">{getSortIndicator("status")}</span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRooms.length > 0 ? (
              paginatedRooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.id}</td>
                  <td>{room.roomNumber}</td>
                  <td>{room.type}</td>
                  <td>{new Intl.NumberFormat("vi-VN").format(room.price)} đ</td>
                  <td>{room.floor}</td>
                  <td>
                    <span className={`room-status-badge ${room.status?.toLowerCase()}`}>
                      {room.status}
                    </span>
                  </td>
                  <td>
                    <div className="room-action-buttons">
                      <button
                        onClick={() => openPanel("edit", room)}
                        className="btn-action btn-action-edit"
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="btn-action btn-action-delete"
                        title="Disable this room (soft delete)"
                      >
                        <i className="fas fa-ban"></i> Disable
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="room-empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>No rooms found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="room-table-footer">
          <div className="room-records-per-page">
            <span>Show:</span>
            <select
              value={recordsPerPage}
              onChange={(e) => {
                setRecordsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>entries / Total: {totalRooms}</span>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalRooms / recordsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <RoomForm
        isOpen={isPanelOpen}
        onClose={closePanel}
        mode={panelMode}
        roomData={currentRoom}
        roomTypes={roomTypes}
        onSave={handleSaveRoom}
      />
    </div>
  );
}
