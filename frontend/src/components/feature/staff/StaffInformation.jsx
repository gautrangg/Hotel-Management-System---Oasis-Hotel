import React from "react";

export default function StaffInformation({
    staff,
    editPreview,
    editRoleId,
    errors,
    roles,
    shiftTypes,
    showPassword,
    setShowPassword,
    handleChangeSelectedStaff,
    handleEditImageChange,
    handleEditRoleChange,
    handleUpdateStaff,
    handleDelete,
}) {
    if (!staff) return null;

    return (
        <div className="add-staff-container">

            <h3>Staff Information</h3>
            <br/>
            <form
                className="add-staff-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateStaff();
                }}
            >
                <div className="t-form-container">
                    {/* Left: Avatar + Roles */}
                    <div className="t-form-left">
                        <div className="t-photo-upload">
                            <p>Staff Photo</p>
                            <img
                                className="t-preview-image"
                                src={
                                    editPreview ||
                                    `http://localhost:8080/upload/avatar/${staff.staffImage}`
                                }
                                alt="avatar"
                            />
                            <input type="file" accept="image/*" onChange={handleEditImageChange} />

                            <div className="t-roles-section">
                                <p>Roles</p>
                                {roles.map((r) => (
                                    <div key={r.roleId}>
                                        <input
                                            type="radio"
                                            name="roleId"
                                            value={r.roleId}
                                            onChange={handleEditRoleChange}
                                            checked={editRoleId === Number(r.roleId)}
                                        />
                                        {r.roleName}
                                    </div>
                                ))}
                                {errors.roles && <span className="error-text">{errors.roles}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Right: Personal + Contact */}
                    <div className="t-form-right">
                        {/* Personal Data */}
                        <div className="t-section">
                            <table>
                                <tbody>
                                    <h3>Personal Data</h3>
                                    <tr className="t-section-row">
                                        <td colSpan={2}>
                                            <p>Full Name</p>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={staff.fullName || ""}
                                                onChange={handleChangeSelectedStaff}
                                            />
                                            {errors.fullName && (
                                                <span className="error-text">{errors.fullName}</span>
                                            )}
                                        </td>
                                    </tr>

                                    <tr className="t-section-row">
                                        <td>
                                            <p>Date of Birth</p>
                                            <input
                                                type="date"
                                                name="birthDate"
                                                value={staff.birthDate || ""}
                                                onChange={handleChangeSelectedStaff}
                                                className="t-date-input"
                                            />
                                            {errors.birthDate && (
                                                <span className="error-text">{errors.birthDate}</span>
                                            )}
                                        </td>
                                        <td>
                                            <p>Gender</p>
                                            <select
                                                name="gender"
                                                value={staff.gender || ""}
                                                onChange={handleChangeSelectedStaff}
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </td>
                                    </tr>

                                    <tr className="t-section-row">
                                        <td colSpan={2}>
                                            <p>Citizen ID</p>
                                            <input
                                                type="text"
                                                name="citizenId"
                                                value={staff.citizenId || ""}
                                                onChange={handleChangeSelectedStaff}
                                            />
                                            {errors.citizenId && <span className="error-text">{errors.citizenId}</span>}
                                        </td>
                                    </tr>

                                    <tr className="t-section-row">
                                        <td colSpan={2} className="password">
                                            <div className="password-wrapper">
                                                <p>Password</p>

                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    value={staff.password || ""}
                                                    onChange={handleChangeSelectedStaff}
                                                />
                                                <i
                                                    className={`bx ${showPassword ? "bx-show" : "bx-hide"}`}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{ cursor: "pointer" }}
                                                ></i>
                                            </div>
                                            {errors.password && (
                                                <span className="error-text">{errors.password}</span>
                                            )}
                                        </td>
                                    </tr>

                                    <tr className="t-section-row">
                                        <td>
                                            <p>Shift Type</p>
                                            <select
                                                name="shiftTypeId"
                                                value={staff.shiftTypeId}
                                                onChange={handleChangeSelectedStaff}
                                            >
                                                {shiftTypes.map((st) => (
                                                    <option key={st.shiftTypeId} value={st.shiftTypeId}>
                                                        {st.shiftTypeName}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <p>Day Off</p>
                                            <select
                                                name="dayOff"
                                                value={staff.dayOff}
                                                onChange={handleChangeSelectedStaff}
                                            >
                                                <option value={7}>Sunday</option>
                                                <option value={1}>Monday</option>
                                                <option value={2}>Tuesday</option>
                                                <option value={3}>Wednesday</option>
                                                <option value={4}>Thursday</option>
                                                <option value={5}>Friday</option>
                                                <option value={6}>Saturday</option>

                                            </select>
                                        </td>
                                    </tr>

                                    <tr className="t-section-row">
                                        <td colSpan={2}>
                                            <p>Hired Date</p>
                                            <input
                                                type="date"
                                                name="chargedDate"
                                                value={staff.chargedDate || ""}
                                                readOnly
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Contact */}
                        <div className="t-section">
                            <table>
                                <tbody>
                                    <h3>Contact</h3>
                                    <tr className="t-section-row">
                                        <td>
                                            <p>Email</p>
                                            <input
                                                type="email"
                                                name="email"
                                                value={staff.email || ""}
                                                onChange={handleChangeSelectedStaff}
                                            />
                                            {errors.email && <span className="error-text">{errors.email}</span>}
                                        </td>
                                    </tr>

                                    <tr className="t-section-row">
                                        <td>
                                            <p>Phone</p>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={staff.phone || ""}
                                                onChange={handleChangeSelectedStaff}
                                            />
                                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                                        </td>
                                    </tr>

                                    <tr className="t-section-row">
                                        <td>
                                            <p>Address</p>
                                            <input
                                                type="text"
                                                name="address"
                                                value={staff.address || ""}
                                                onChange={handleChangeSelectedStaff}
                                            />
                                            {errors.address && <span className="error-text">{errors.address}</span>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="t-delete-btn"
                                onClick={() => handleDelete(staff.staffId)}
                            >
                                Delete Staff
                            </button>
                            <button type="submit" className="t-orange-btn">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
