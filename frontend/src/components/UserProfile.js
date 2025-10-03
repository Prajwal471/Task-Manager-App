import React, { useState, useEffect } from 'react';
import { GetUserProfile, UpdateUserProfile, ChangePassword } from '../api';
import { notify } from '../utils';
import { FaUser, FaPalette, FaKey, FaSave } from 'react-icons/fa';

function UserProfile({ isOpen, onClose }) {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        theme: 'light',
        timezone: 'UTC',
        preferences: {
            emailNotifications: true,
            defaultTaskPriority: 'medium',
            taskViewMode: 'list'
        }
    });
    
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
        }
    }, [isOpen]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await GetUserProfile();
            if (response.success) {
                setProfile(response.data);
            }
        } catch (err) {
            notify('Failed to fetch profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        try {
            setLoading(true);
            const response = await UpdateUserProfile(profile);
            if (response.success) {
                notify('Profile updated successfully', 'success');
                // Update theme immediately
                if (profile.theme) {
                    document.body.setAttribute('data-bs-theme', profile.theme);
                    localStorage.setItem('theme', profile.theme);
                }
            } else {
                notify(response.message || 'Failed to update profile', 'error');
            }
        } catch (err) {
            notify('Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            notify('New passwords do not match', 'error');
            return;
        }

        try {
            setLoading(true);
            const response = await ChangePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            
            if (response.success) {
                notify('Password changed successfully', 'success');
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                notify(response.message || 'Failed to change password', 'error');
            }
        } catch (err) {
            notify('Failed to change password', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <FaUser className="me-2" />
                            User Profile
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        {/* Tab Navigation */}
                        <ul className="nav nav-tabs mb-4">
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('profile')}
                                >
                                    <FaUser className="me-2" />
                                    Profile
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'preferences' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('preferences')}
                                >
                                    <FaPalette className="me-2" />
                                    Preferences
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('security')}
                                >
                                    <FaKey className="me-2" />
                                    Security
                                </button>
                            </li>
                        </ul>

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div>
                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={profile.name}
                                        onChange={(e) => setProfile(prev => ({...prev, name: e.target.value}))}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={profile.email}
                                        readOnly
                                        disabled
                                    />
                                    <small className="text-muted">Email cannot be changed</small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Timezone</label>
                                    <select 
                                        className="form-select"
                                        value={profile.timezone}
                                        onChange={(e) => setProfile(prev => ({...prev, timezone: e.target.value}))}
                                    >
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">Eastern Time</option>
                                        <option value="America/Chicago">Central Time</option>
                                        <option value="America/Denver">Mountain Time</option>
                                        <option value="America/Los_Angeles">Pacific Time</option>
                                        <option value="Europe/London">London</option>
                                        <option value="Europe/Paris">Paris</option>
                                        <option value="Asia/Tokyo">Tokyo</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <div>
                                <div className="mb-3">
                                    <label className="form-label">Theme</label>
                                    <select 
                                        className="form-select"
                                        value={profile.theme}
                                        onChange={(e) => setProfile(prev => ({...prev, theme: e.target.value}))}
                                    >
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Default Task Priority</label>
                                    <select 
                                        className="form-select"
                                        value={profile.preferences?.defaultTaskPriority || 'medium'}
                                        onChange={(e) => setProfile(prev => ({
                                            ...prev, 
                                            preferences: {
                                                ...prev.preferences,
                                                defaultTaskPriority: e.target.value
                                            }
                                        }))}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Default View Mode</label>
                                    <select 
                                        className="form-select"
                                        value={profile.preferences?.taskViewMode || 'list'}
                                        onChange={(e) => setProfile(prev => ({
                                            ...prev, 
                                            preferences: {
                                                ...prev.preferences,
                                                taskViewMode: e.target.value
                                            }
                                        }))}
                                    >
                                        <option value="list">List</option>
                                        <option value="grid">Grid</option>
                                        <option value="calendar">Calendar</option>
                                    </select>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={profile.preferences?.emailNotifications || false}
                                        onChange={(e) => setProfile(prev => ({
                                            ...prev, 
                                            preferences: {
                                                ...prev.preferences,
                                                emailNotifications: e.target.checked
                                            }
                                        }))}
                                    />
                                    <label className="form-check-label">
                                        Email Notifications
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div>
                                <h6 className="mb-3">Change Password</h6>
                                <div className="mb-3">
                                    <label className="form-label">Current Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm(prev => ({...prev, currentPassword: e.target.value}))}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
                                    />
                                </div>
                                <button 
                                    className="btn btn-warning"
                                    onClick={handlePasswordChange}
                                    disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                                >
                                    <FaKey className="me-2" />
                                    Change Password
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Close
                        </button>
                        {activeTab !== 'security' && (
                            <button 
                                type="button" 
                                className="btn btn-primary"
                                onClick={handleProfileUpdate}
                                disabled={loading}
                            >
                                <FaSave className="me-2" />
                                Save Changes
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;