import React, { useState } from 'react';
import '@assets/customer/ChangePasswordPage.css';

const ChangePasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.oldPassword) {
      setError('Please enter old password');
      return false;
    }

    if (!formData.newPassword) {
      setError('Please enter new password');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return false;
    }

    if (formData.newPassword === formData.oldPassword) {
      setError('The new password must be different from the old password.');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Confirm password does not match');
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      setError("Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('http://localhost:8080/api/customers/me/change-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      if (response.status === 401) {
        setError('Your session has expired. Please log in again!');
        setTimeout(() => window.location.href = '/login', 2000);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Password change failed');
      }

      setSuccess('Password changed successfully!');

      // Reset form
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Redirect về profile sau 2s
      setTimeout(() => {
        window.location.href = '/profile';
      }, 2000);

    } catch (err) {
      setError(err.message || 'An error occurred. Please try again!');
      console.error('Change password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/profile';
  };

  return (
    <div className="c-profile-change-password-page">
      <div className="c-profile-change-password-container">
        {/* Sidebar */}
        <div className="c-profile-change-password-sidebar">
          <div className="c-profile-sidebar-card">
            <h3 className="c-profile-sidebar-title">Account Settings</h3>
            <nav className="c-profile-sidebar-menu">
              <button
                onClick={() => window.location.href = '/profile'}
                className="c-profile-menu-item"
              >
                <i className='bx bx-edit-alt'></i>
                Profile Information
              </button>
              <button
                className="c-profile-menu-item c-profile-menu-item-active"
              >
                <i className='bx bxs-key '></i>
                Change Password
              </button>
              <button
                onClick={() => window.location.href = '/my-bookings'}
                className="c-profile-menu-item"
              >
                <i className='bx bx-book-bookmark'></i>
                My Bookings
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="c-profile-change-password-main">
          <div className="c-profile-change-password-card">
            <div className="c-profile-card-header">
              <h2 className="c-profile-card-title">Change Password</h2>
              <p className="c-profile-card-subtitle">Update your password to keep your account secure</p>
            </div>

            {error && (
              <div className="c-profile-alert c-profile-alert-error">
                <span className="c-profile-alert-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="c-profile-alert c-profile-alert-success">
                <span className="c-profile-alert-icon">✅</span>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="c-profile-password-form">

              {/* Old Password */}
              <div className="c-profile-form-group">
                <label className="c-profile-form-label">Current Password</label>
                <div className="c-profile-password-input-wrapper">
                  <input
                    type={showPasswords.old ? 'text' : 'password'}
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    className="c-profile-form-input"
                    placeholder="Enter current password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="c-profile-toggle-password"
                    onClick={() => togglePasswordVisibility('old')}
                  >
                    {showPasswords.old ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="c-profile-form-group">
                <label className="c-profile-form-label">New Password</label>
                <div className="c-profile-password-input-wrapper">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="c-profile-form-input"
                    placeholder="Enter new password (min 6 characters)"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="c-profile-toggle-password"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="c-profile-form-hint">Must be at least 6 characters long</p>
              </div>

              {/* Confirm Password */}
              <div className="c-profile-form-group">
                <label className="c-profile-form-label">Confirm New Password</label>
                <div className="c-profile-password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="c-profile-form-input"
                    placeholder="Re-enter new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="c-profile-toggle-password"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="c-profile-form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="c-profile-btn c-profile-btn-primary"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="c-profile-btn c-profile-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="c-profile-password-tips">
              <h3 className="c-profile-tips-title">Password Tips:</h3>
              <ul className="c-profile-tips-list">
                <li>Use at least 6 characters</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Add numbers and special characters</li>
                <li>Avoid using personal information</li>
                <li>Don't reuse old passwords</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;