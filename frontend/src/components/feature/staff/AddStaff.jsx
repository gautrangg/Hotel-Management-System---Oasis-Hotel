import React from "react";

export default function AddStaff({
    roles,
    shiftTypes,
    addForm,
    addPreview,
    addErrors,
    showPassword,
    setShowPassword,
    handleAddImageChange,
    handleAddFormChange,
    handleAddStaff,
}) {


    return (
        <div className="add-staff-container">
            <h3>Add Staffs</h3>
            <br/>
            <form className="add-staff-form" onSubmit={handleAddStaff}>
                <div className="t-form-container">
                    {/* Left: Avatar + Roles */}
                    <div className="t-form-left">
                        <div className="t-photo-upload">
                            <p>Staff Photo</p>
                            {addPreview && (
                                <img className="t-preview-image" src={addPreview} alt="Preview" />
                            )}
                            <input type="file" accept="image/*" onChange={handleAddImageChange} />

                            <div className="t-roles-section">
                                <p>Roles</p>
                                {roles.map((r) => (
                                    <div key={r.roleId}>
                                        <input
                                            type="radio"
                                            name="roleId"
                                            value={r.roleId}
                                            onChange={handleAddFormChange}
                                            checked={addForm.roleId === r.roleId}
                                        />
                                        {r.roleName}
                                    </div>
                                ))}


                                {addErrors.roles && <span className="error-text">{addErrors.roles}</span>}
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
                                                placeholder="Full Name"
                                                value={addForm.fullName}
                                                onChange={handleAddFormChange}
                                            />
                                            {addErrors.fullName && <span className="error-text">{addErrors.fullName}</span>}
                                        </td>
                                    </tr>

                                    <tr className="t-section-row">
                                        <td>
                                            <p>Date of Birth</p>
                                            <input
                                                type="date"
                                                name="birthDate"
                                                value={addForm.birthDate}
                                                onChange={handleAddFormChange}
                                                className="t-date-input"
                                            /><br></br>
                                            {addErrors.birthDate && <span className="error-text">{addErrors.birthDate}</span>}
                                        </td>
                                        <td>
                                            <p>Gender</p>
                                            <select name="gender" value={addForm.gender} onChange={handleAddFormChange}>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select><br></br>
                                            {addErrors.birthDate && <span className="error-text">.</span>}
                                        </td>
                                    </tr>

                                    <tr className="t-section-row">
                                        <td colSpan={2}>
                                            <p>Citizen ID</p>
                                            <input
                                                type="text"
                                                name="citizenId"
                                                placeholder="Citizen ID"
                                                value={addForm.citizenId}
                                                onChange={handleAddFormChange}
                                            />
                                            {addErrors.citizenId && <span className="error-text">{addErrors.citizenId}</span>}
                                        </td>
                                    </tr>

                                    <tr className="t-section-row">
                                        <td>
                                            <p>Shift Type</p>
                                            <select
                                                name="shiftTypeId"
                                                value={addForm.shiftType}
                                                onChange={handleAddFormChange}
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
                                                value={addForm.dayOff}
                                                onChange={handleAddFormChange}
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
                                        <td colSpan={2} className="password">
                                            <div className="password-wrapper">
                                                <p>Password</p>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    placeholder="Password"
                                                    value={addForm.password}
                                                    onChange={handleAddFormChange}
                                                />
                                                <i
                                                    className={`bx ${showPassword ? "bx-show" : "bx-hide"}`}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{ cursor: "pointer" }}
                                                ></i>
                                                {addErrors.password && <span className="error-text">{addErrors.password}</span>}
                                            </div>
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
                                                placeholder="Email"
                                                value={addForm.email}
                                                onChange={handleAddFormChange}
                                            />
                                            {addErrors.email && <span className="error-text">{addErrors.email}</span>}
                                        </td>
                                    </tr>

                                    <tr className="t-section-row">
                                        <td>
                                            <p>Phone</p>
                                            <input
                                                type="text"
                                                name="phone"
                                                placeholder="Phone"
                                                value={addForm.phone}
                                                onChange={handleAddFormChange}
                                            />
                                            {addErrors.phone && <span className="error-text">{addErrors.phone}</span>}
                                        </td>
                                    </tr>

                                    <tr className="t-section-row">
                                        <td>
                                            <p>Address</p>
                                            <input
                                                type="text"
                                                name="address"
                                                placeholder="Address"
                                                value={addForm.address}
                                                onChange={handleAddFormChange}
                                            />
                                            {addErrors.address && <span className="error-text">{addErrors.address}</span>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <input type="submit" className="t-orange-btn" value="Add" />
                    </div>
                </div>

            </form>

        </div>
    );
}