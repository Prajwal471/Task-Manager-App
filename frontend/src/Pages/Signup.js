import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [theme, setTheme] = useState('light');
    const [passwordStrength, setPasswordStrength] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        // Apply saved theme or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.body.setAttribute('data-bs-theme', savedTheme);
    }, []);

    useEffect(() => {
        // Calculate password strength (simplified)
        const password = signupInfo.password;
        let strength = 0;
        if (password.length >= 6) strength += 25;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
        setPasswordStrength(strength);
    }, [signupInfo.password]);

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 25) return '#dc3545';
        if (passwordStrength < 50) return '#fd7e14';
        if (passwordStrength < 75) return '#ffc107';
        return '#198754';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength < 25) return 'Weak';
        if (passwordStrength < 50) return 'Fair';
        if (passwordStrength < 75) return 'Good';
        return 'Strong';
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!signupInfo.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (signupInfo.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        
        if (!signupInfo.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(signupInfo.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        
        if (!signupInfo.password) {
            newErrors.password = 'Password is required';
        } else if (signupInfo.password.length < 4) {
            newErrors.password = 'Password must be at least 4 characters';
        }
        
        if (!signupInfo.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (signupInfo.password !== signupInfo.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupInfo(prev => ({ ...prev, [name]: value }));
        
        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }

    const handleSignup = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        try {
            const { confirmPassword, ...submitData } = signupInfo;
            const url = `http://localhost:8080/auth/signup`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitData)
            });
            
            const result = await response.json();
            const { success, message, error } = result;
            
            if (success) {
                handleSuccess(message || 'Account created successfully!');
                setTimeout(() => {
                    navigate('/login')
                }, 1500)
            } else if (error) {
                const details = error?.details?.[0]?.message || error.message || 'Signup failed';
                handleError(details);
            } else {
                handleError(message || 'Signup failed');
            }
        } catch (err) {
            console.error('Signup error:', err);
            handleError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.body.setAttribute('data-bs-theme', newTheme);
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{
            background: theme === 'dark' 
                ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
                : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
        }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
                            <div className="card-body p-5">
                                {/* Header with theme toggle */}
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div>
                                        <div className="d-flex align-items-center mb-3">
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '15px',
                                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                                            }}>
                                                <i className="fas fa-stream" style={{ color: 'white', fontSize: '20px' }}></i>
                                            </div>
                                            <div style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                letterSpacing: '1px'
                                            }}>TaskFlow</div>
                                        </div>
                                        <h2 className="fw-bold mb-0 text-primary">Create Account</h2>
                                        <p className="text-muted mb-0">Join TaskFlow today!</p>
                                    </div>
                                    <button 
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm rounded-circle p-2"
                                        onClick={toggleTheme}
                                        style={{ width: '40px', height: '40px' }}
                                    >
                                        {theme === 'light' ? '🌙' : '☀️'}
                                    </button>
                                </div>

                                <form onSubmit={handleSignup} className="needs-validation" noValidate>
                                    {/* Name Field */}
                                    <div className="mb-4">
                                        <label htmlFor='name' className="form-label fw-semibold">
                                            <i className="fas fa-user me-2"></i>Full Name
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text border-end-0 bg-transparent">
                                                <i className="fas fa-user text-muted"></i>
                                            </span>
                                            <input
                                                id="name"
                                                onChange={handleChange}
                                                type='text'
                                                name='name'
                                                className={`form-control border-start-0 ps-0 ${errors.name ? 'is-invalid' : ''}`}
                                                placeholder='Enter your full name'
                                                value={signupInfo.name}
                                                autoComplete="name"
                                                autoFocus
                                                style={{ fontSize: '16px' }}
                                            />
                                        </div>
                                        {errors.name && (
                                            <div className="invalid-feedback d-block">
                                                <i className="fas fa-exclamation-circle me-1"></i>
                                                {errors.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div className="mb-4">
                                        <label htmlFor='email' className="form-label fw-semibold">
                                            <i className="fas fa-envelope me-2"></i>Email Address
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text border-end-0 bg-transparent">
                                                <i className="fas fa-envelope text-muted"></i>
                                            </span>
                                            <input
                                                id="email"
                                                onChange={handleChange}
                                                type='email'
                                                name='email'
                                                className={`form-control border-start-0 ps-0 ${errors.email ? 'is-invalid' : ''}`}
                                                placeholder='Enter your email address'
                                                value={signupInfo.email}
                                                autoComplete="email"
                                                style={{ fontSize: '16px' }}
                                            />
                                        </div>
                                        {errors.email && (
                                            <div className="invalid-feedback d-block">
                                                <i className="fas fa-exclamation-circle me-1"></i>
                                                {errors.email}
                                            </div>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div className="mb-4">
                                        <label htmlFor='password' className="form-label fw-semibold">
                                            <i className="fas fa-lock me-2"></i>Password
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text border-end-0 bg-transparent">
                                                <i className="fas fa-lock text-muted"></i>
                                            </span>
                                            <input
                                                id="password"
                                                onChange={handleChange}
                                                type={showPassword ? 'text' : 'password'}
                                                name='password'
                                                className={`form-control border-start-0 border-end-0 ps-0 ${errors.password ? 'is-invalid' : ''}`}
                                                placeholder='Create a password'
                                                value={signupInfo.password}
                                                autoComplete="new-password"
                                                style={{ fontSize: '16px' }}
                                            />
                                            <button
                                                type="button"
                                                className="input-group-text border-start-0 bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                                            </button>
                                        </div>
                                        
                                        {/* Password Strength Indicator */}
                                        {signupInfo.password && (
                                            <div className="mt-2">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <small className="text-muted">Password Strength</small>
                                                    <small style={{ color: getPasswordStrengthColor() }}>
                                                        {getPasswordStrengthText()}
                                                    </small>
                                                </div>
                                                <div className="progress" style={{ height: '4px' }}>
                                                    <div 
                                                        className="progress-bar" 
                                                        style={{ 
                                                            width: `${passwordStrength}%`,
                                                            backgroundColor: getPasswordStrengthColor(),
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {errors.password && (
                                            <div className="invalid-feedback d-block">
                                                <i className="fas fa-exclamation-circle me-1"></i>
                                                {errors.password}
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="mb-4">
                                        <label htmlFor='confirmPassword' className="form-label fw-semibold">
                                            <i className="fas fa-lock me-2"></i>Confirm Password
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text border-end-0 bg-transparent">
                                                <i className="fas fa-lock text-muted"></i>
                                            </span>
                                            <input
                                                id="confirmPassword"
                                                onChange={handleChange}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name='confirmPassword'
                                                className={`form-control border-start-0 border-end-0 ps-0 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                                placeholder='Confirm your password'
                                                value={signupInfo.confirmPassword}
                                                autoComplete="new-password"
                                                style={{ fontSize: '16px' }}
                                            />
                                            <button
                                                type="button"
                                                className="input-group-text border-start-0 bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <div className="invalid-feedback d-block">
                                                <i className="fas fa-exclamation-circle me-1"></i>
                                                {errors.confirmPassword}
                                            </div>
                                        )}
                                    </div>

                                    {/* Signup Button */}
                                    <button 
                                        type='submit' 
                                        className="btn btn-primary w-100 py-3 mb-4 fw-semibold"
                                        disabled={loading}
                                        style={{ 
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            background: loading ? '#6c757d' : 'linear-gradient(45deg, #764ba2, #667eea)',
                                            border: 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-user-plus me-2"></i>
                                                Create Account
                                            </>
                                        )}
                                    </button>

                                    {/* Login Link */}
                                    <div className="text-center">
                                        <p className="mb-0 text-muted">
                                            Already have an account? {' '}
                                            <Link 
                                                to="/login" 
                                                className="text-decoration-none fw-semibold"
                                                style={{ color: '#667eea' }}
                                            >
                                                Sign In
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="text-center mt-4">
                            <p className="text-white-50 mb-0">
                                <i className="fas fa-shield-alt me-2"></i>
                                We protect your privacy and data with TaskFlow
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={theme}
            />
        </div>
    )
}

export default Signup;