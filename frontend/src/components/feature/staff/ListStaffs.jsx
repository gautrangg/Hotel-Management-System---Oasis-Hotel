import React, { useState } from "react";
import useStaff from "@hooks/useStaff";
import Pagination from "@components/base/ui/Pagination";
import AddStaff from "@components/feature/staff/AddStaff";
import StaffInformation from "@components/feature/staff/StaffInformation";

export default function ListStaffs() {
    const [showOverlay, setShowOverlay] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [activeForm, setActiveForm] = useState(null);
    const {
        currentStaffs,
        staffRolesMap,
        totalPages,
        currentPage,
        setCurrentPage,
        selectedRole,
        setSelectedRole,
        recordsPerPage,
        setRecordsPerPage,
        searchTerm,
        setSearchTerm,
        roles,
        handleSelect,
        handleCloseModal,

        shiftTypes,
        selectedStaff,
        editPreview,
        editRoleId,
        errors,
        showPassword,
        setShowPassword,
        handleChangeSelectedStaff,
        handleEditImageChange,
        handleEditRoleChange,
        handleUpdateStaff,
        handleDelete,

        addForm,
        addPreview,
        addErrors,
        handleAddImageChange,
        handleAddFormChange,
        handleAddRoleChange,
        handleAddStaff
    } = useStaff();


    const openForm = (formType) => {
        setActiveForm(formType);
        setShowOverlay(true);
        setTimeout(() => setShowSidebar(true), 10);
    };

    const closeForm = () => {
        setShowSidebar(false);
        setTimeout(() => {
            setShowOverlay(false);
            setActiveForm(null);
            handleCloseModal();
        }, 300);
    };
    return (
        <div className="list-staff-container">

            <h2>Staff Management</h2>

            {/* Search */}
            <div className="search-container">
                <select
                    value={selectedRole}
                    onChange={(e) => {
                        setSelectedRole(e.target.value);
                        setCurrentPage(1);
                    }}
                >
                    <option value="">All Roles</option>
                    {roles.map((r) => (
                        <option key={r.roleId} value={r.roleName}>
                            {r.roleName}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="Search by name, phone or email..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />

                <button className="t-orange-btn" >Search</button>

                {/* Nút mở form Add Staff */}
                <button
                    className="t-orange-btn"
                    onClick={() => openForm("add")}
                >
                    + Add Staff
                </button>
            </div>

            <div className="t-staff-grid-container">
                {currentStaffs.map((staff) => (
                    <div className="t-staff-grid-card" key={staff.staffId}>
                        <div className="t-staff-grid-avatar">
                            <img
                                src={`http://localhost:8080/upload/avatar/${staff.staffImage}?t=${Date.now()}`}
                                alt={staff.fullName}
                            />
                        </div>

                        <div className="t-staff-grid-info">
                            <h3>{staff.fullName}</h3>
                            <p className="t-staff-grid-roles">{staffRolesMap[staff.staffId] || ""}</p>

                        </div>

                        <div className="t-staff-grid-contact">
                            <p>
                                <span className="t-staff-grid-label">#</span> {staff.citizenId}
                            </p>
                            <p>
                                <i className="bx bx-envelope t-staff-grid-icon"></i> {staff.email}
                            </p>
                            <p>
                                <i className="bx bx-phone t-staff-grid-icon"></i> {staff.phone}
                            </p>
                        </div>

                        <div className="t-staff-grid-footer">
                            <button onClick={() => { handleSelect(staff); openForm("info"); }}>
                                View Detail &gt;
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="table-footer">
                <div className="records-per-page">
                    <span>Show:</span>
                    <select value={recordsPerPage} onChange={(e) => { setRecordsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span>entries</span>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Overlay + Sidebar (dùng chung cho cả AddStaff và StaffInformation) */}
            {showOverlay && (
                <div
                    className={`staff-form-overlay ${showOverlay ? "show" : ""}`}
                    onClick={closeForm}
                >
                    <div
                        className={`staff-form-sidebar ${showSidebar ? "open" : ""}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="staff-form-close-btn" onClick={closeForm}>
                            ✖
                        </button>

                        {activeForm === "add" &&
                            <AddStaff
                                roles={roles}
                                shiftTypes={shiftTypes}
                                addForm={addForm}
                                addPreview={addPreview}
                                addErrors={addErrors}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                                handleAddImageChange={handleAddImageChange}
                                handleAddFormChange={handleAddFormChange}
                                handleAddRoleChange={handleAddRoleChange}
                                handleAddStaff={handleAddStaff}
                            />
                        }

                        {activeForm === "info" && (
                            <StaffInformation
                                staff={selectedStaff}
                                editPreview={editPreview}
                                editRoleId={editRoleId}
                                errors={errors}
                                roles={roles}
                                shiftTypes={shiftTypes}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                                handleChangeSelectedStaff={handleChangeSelectedStaff}
                                handleEditImageChange={handleEditImageChange}
                                handleEditRoleChange={handleEditRoleChange}
                                handleUpdateStaff={handleUpdateStaff}
                                handleDelete={handleDelete}
                            />

                        )}

                    </div>
                </div>
            )}
        </div>
    );
}