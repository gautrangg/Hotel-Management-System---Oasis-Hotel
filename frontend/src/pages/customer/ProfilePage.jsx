import React, { useState, useEffect } from 'react';
import "@assets/customer/ProfilePage.css";
import CustomerHeader from "@components/layout/CustomerHeader";
import Footer from "@components/layout/Footer";
import Swal from 'sweetalert2';

const ProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        citizenId: '',
        birthDate: '',
        gender: 'Male',
        address: '',
        avatar: ''
    });

    const [originalData, setOriginalData] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found. Please login again.');
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);

            const response = await fetch('http://localhost:8080/api/customers/me', {
                headers: getAuthHeaders()
            });

            if (response.status === 401) {
                setError('Your session has expired. Please log in again!');
                setTimeout(() => window.location.href = '/login', 2000);
                return;
            }

            if (!response.ok) throw new Error('Failed to load profile');

            const data = await response.json();
            const profileData = {
                fullName: data.fullName || '',
                email: data.email || '',
                phone: data.phone || '',
                citizenId: data.citizenId || '',
                birthDate: data.birthDate || '',
                gender: data.gender || 'Male',
                address: data.address || '',
                avatar: data.avatar || ''
            };

            setFormData(profileData);
            setOriginalData(profileData);
            setError('');
        } catch (err) {
            setError('Unable to load profile information. Please try again!');
            console.error('Fetch profile error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            setError('Full name cannot be left blank');
            return false;
        }
        if (formData.fullName.length < 3) {
            setError('Full name must be at least 3 characters long');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Invalid email');
            return false;
        }

        const phoneRegex = /^[0-9]{10,11}$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            setError('Phone number must have 10-11 digits');
            return false;
        }

        if (formData.citizenId && formData.citizenId.length !== 12) {
            setError('Citizen ID must have exactly 12 numbers');
            return false;
        }

        if (formData.birthDate) {
            const birthYear = new Date(formData.birthDate).getFullYear();
            const currentYear = new Date().getFullYear();
            const age = currentYear - birthYear;

            if (age < 18) {
                setError('You must be 18 years of age or older');
                return false;
            }
            if (age > 100) {
                setError('Invalid date of birth');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const response = await fetch('http://localhost:8080/api/customers/me', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            if (response.status === 401) {
                setError('Your session has expired. Please log in again!');
                setTimeout(() => window.location.href = '/login', 2000);
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Update Failed');
            }

            await response.json();
            setOriginalData(formData);
            setSuccess('Information updated successfully!');
            setIsEditing(false);

            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.!');
            console.error('Update profile error:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(originalData);
        setIsEditing(false);
        setError('');
        setSuccess('');
    };

    const handleChangePassword = () => {
        window.location.href = '/change-password';
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Are you sure you want to log out?',
            text: "You will need to log in again to use the service.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Log Out',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                localStorage.removeItem('customerId');
                window.location.href = '/login';
            }
        });
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Tạo FormData để upload file    
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:8080/api/customers/me/upload-avatar', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            setFormData(prev => ({ ...prev, avatar: data.avatarUrl }));
        }
    };

    return (
        <>
            <CustomerHeader />
            <div className="c-profile-profile-page">

                <div className="c-profile-profile-container">

                    <aside className="c-profile-profile-sidebar">
                        <div className="c-profile-sidebar-card">
                            <h2 className="c-profile-sidebar-title">Account Settings</h2>

                            <div className="c-profile-avatar-section">
                                <div className="c-profile-avatar-wrapper">
                                    {formData.avatar && formData.avatar !== "avatar.png" ? (
                                        <img src={`http://localhost:8080/upload/avatar/${formData.avatar}`} alt="Avatar" className="c-profile-avatar-image" />
                                    ) : (
                                        <div className="c-profile-avatar-placeholder">
                                            <span className="c-profile-avatar-initial">
                                                {formData.fullName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="c-profile-avatar-label">Avatar</p>
                                {isEditing && (
                                    <>
                                        <input type="file" id="avatar-upload" onChange={handleAvatarChange} style={{ display: 'none' }} accept="image/*" />
                                        <button className="c-profile-edit-avatar-btn" onClick={() => document.getElementById('avatar-upload').click()}>
                                            Edit avatar
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="c-profile-sidebar-menu">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`c-profile-menu-item  ${isEditing ? 'c-profile-menu-item-active' : ''}`}
                                >
                                    <i className='bx bx-edit-alt'></i>
                                    {isEditing ? ' Cancel Edit' : ' Edit profile'}
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    className="c-profile-menu-item"
                                >   <i className='bx bxs-key '></i>
                                    Change Password

                                </button>
                                <button
                                    onClick={() => window.location.href = '/my-bookings'}
                                    className="c-profile-menu-item"
                                >
                                    <i className='bx bx-book-bookmark'></i>
                                    My Bookings
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="c-profile-menu-item c-profile-logout"
                                >   <i class='bx bx-log-out-circle ' ></i>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </aside>

                    <main className="c-profile-profile-main">
                        <div className="c-profile-main-card">
                            <div className="c-profile-main-header">
                                <h3 className="c-profile-main-title">
                                    Profile / {isEditing ? 'Edit profile' : 'View profile'}
                                </h3>
                            </div>

                            {error && (
                                <div className="c-profile-alert c-profile-alert-error">
                                    <span className="c-profile-alert-icon"></span>
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="c-profile-alert c-profile-alert-success">
                                    <span className="c-profile-alert-icon"></span>
                                    {success}
                                </div>
                            )}

                            <div className="c-profile-form-grid">

                                <div className="c-profile-form-group">
                                    <label className="c-profile-form-label">Full name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="c-profile-form-input"
                                        placeholder="Nguyễn Văn An"
                                    />
                                </div>

                                <div className="c-profile-form-group">
                                    <label className="c-profile-form-label">Identity Card</label>
                                    <input
                                        type="text"
                                        name="citizenId"
                                        value={formData.citizenId}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        maxLength="12"
                                        className="c-profile-form-input"
                                        placeholder="Citizen identity"
                                    />
                                </div>

                                <div className="c-profile-form-group">
                                    <label className="c-profile-form-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="c-profile-form-input"
                                        placeholder="an.nguyen@gmail.com"
                                    />
                                </div>

                                <div className="c-profile-form-group">
                                    <label className="c-profile-form-label">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        maxLength="11"
                                        className="c-profile-form-input"
                                        placeholder="0999999999"
                                    />
                                </div>

                                <div className="c-profile-form-group">
                                    <label className="c-profile-form-label">Gender</label>
                                    <div className="c-profile-radio-group">
                                        <label className="c-profile-radio-label">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="Male"
                                                checked={formData.gender === 'Male'}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="c-profile-radio-input"
                                            />
                                            <span>Male</span>
                                        </label>
                                        <label className="c-profile-radio-label">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="Female"
                                                checked={formData.gender === 'Female'}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="c-profile-radio-input"
                                            />
                                            <span>Female</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="c-profile-form-group">
                                    <label className="c-profile-form-label">Birth Date</label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="c-profile-form-input"
                                    />
                                </div>

                                <div className="c-profile-form-group c-profile-form-group-full">
                                    <label className="c-profile-form-label">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        rows="3"
                                        className="c-profile-form-textarea"
                                        placeholder="abc, Hà Nội"
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="c-profile-form-actions">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={saving}
                                        className="c-profile-btn c-profile-btn-primary"
                                    >
                                        {saving ? 'Saving...' : 'Update'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="c-profile-btn c-profile-btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </main>
                </div>

            </div>
            <Footer />
        </>
    );
};

export default ProfilePage;