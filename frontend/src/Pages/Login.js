import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [theme, setTheme] = useState('light');

    const navigate = useNavigate();

    useEffect(() => {
        // Apply saved theme or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.body.setAttribute('data-bs-theme', savedTheme);
    }, []);

    const validateForm = () => {
        const newErrors = {};
        
        if (!loginInfo.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(loginInfo.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        
        if (!loginInfo.password) {
            newErrors.password = 'Password is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo(prev => ({ ...prev, [name]: value }));
        
        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        try {
            const url = `http://localhost:8080/auth/login`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            
            const result = await response.json();
            const { success, message, jwtToken, name, error } = result;
            
            if (success) {
                handleSuccess(message || 'Login successful!');
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                setTimeout(() => {
                    navigate('/taskmanager')
                }, 1000)
            } else if (error) {
                const details = error?.details?.[0]?.message || error.message || 'Login failed';
                handleError(details);
            } else {
                handleError(message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
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
        <div className="login-container" style={{
            minHeight: '100vh',
            background: theme === 'dark' 
                ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background Elements */}
            <div className="floating-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
            </div>
            
            <div className="container-fluid">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
                        <div className="login-card" style={{
                            background: theme === 'dark' 
                                ? 'rgba(30, 30, 30, 0.95)'
                                : 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '25px',
                            padding: '50px 40px',
                            boxShadow: theme === 'dark'
                                ? '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                                : '0 25px 50px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.3)',
                            border: 'none',
                            position: 'relative',
                            animation: 'slideInUp 0.8s ease-out'
                        }}>
                            {/* Header Section */}
                            <div className="text-center mb-5">
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div className="text-start flex-grow-1">
                                        <div className="logo-section mb-3">
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                                borderRadius: '15px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '20px',
                                                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                                            }}>
                                                <i className="fas fa-stream" style={{ color: 'white', fontSize: '24px' }}></i>
                                            </div>
                                            <div style={{
                                                fontSize: '1.2rem',
                                                fontWeight: '700',
                                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                marginBottom: '5px',
                                                letterSpacing: '1px'
                                            }}>TaskFlow</div>
                                        </div>
                                        <h1 style={{
                                            fontSize: '2.5rem',
                                            fontWeight: '700',
                                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            marginBottom: '10px',
                                            letterSpacing: '-0.5px'
                                        }}>Welcome Back</h1>
                                        <p style={{
                                            color: theme === 'dark' ? '#a0a0a0' : '#6b7280',
                                            fontSize: '1.1rem',
                                            marginBottom: '0',
                                            fontWeight: '400'
                                        }}>Sign in to continue your journey</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={toggleTheme}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '15px',
                                            border: theme === 'dark' ? '2px solid #374151' : '2px solid #e5e7eb',
                                            background: theme === 'dark' ? '#1f2937' : '#f9fafb',
                                            color: theme === 'dark' ? '#f3f4f6' : '#374151',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            fontSize: '20px'
                                        }}
                                    >
                                        {theme === 'light' ? '🌙' : '☀️'}
                                    </button>
                                </div>
                            </div>

                                <form onSubmit={handleLogin} className="needs-validation" noValidate>
                                    {/* Email Field */}
                                    <div className="mb-4">
                                        <label htmlFor='email' style={{
                                            fontSize: '0.95rem',
                                            fontWeight: '600',
                                            color: theme === 'dark' ? '#f3f4f6' : '#374151',
                                            marginBottom: '8px',
                                            display: 'block'
                                        }}>
                                            Email Address
                                        </label>
                                        <div className="position-relative">
                                            <input
                                                id="email"
                                                onChange={handleChange}
                                                type='email'
                                                name='email'
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                placeholder='Enter your email address'
                                                value={loginInfo.email}
                                                autoComplete="email"
                                                style={{
                                                    height: '55px',
                                                    paddingLeft: '50px',
                                                    fontSize: '16px',
                                                    borderRadius: '15px',
                                                    border: errors.email 
                                                        ? '2px solid #ef4444' 
                                                        : theme === 'dark' 
                                                            ? '2px solid #374151' 
                                                            : '2px solid #e5e7eb',
                                                    background: theme === 'dark' ? '#1f2937' : '#f9fafb',
                                                    color: theme === 'dark' ? '#f3f4f6' : '#374151',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: 'none'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.background = theme === 'dark' ? '#2a3441' : '#ffffff';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = errors.email 
                                                        ? '#ef4444' 
                                                        : theme === 'dark' ? '#374151' : '#e5e7eb';
                                                    e.target.style.boxShadow = 'none';
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.background = theme === 'dark' ? '#1f2937' : '#f9fafb';
                                                }}
                                            />
                                            <i className="fas fa-envelope" style={{
                                                position: 'absolute',
                                                left: '18px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#9ca3af',
                                                fontSize: '16px',
                                                pointerEvents: 'none'
                                            }}></i>
                                        </div>
                                        {errors.email && (
                                            <div style={{
                                                color: '#ef4444',
                                                fontSize: '0.875rem',
                                                marginTop: '5px',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <i className="fas fa-exclamation-circle me-2"></i>
                                                {errors.email}
                                            </div>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div className="mb-4">
                                        <label htmlFor='password' style={{
                                            fontSize: '0.95rem',
                                            fontWeight: '600',
                                            color: theme === 'dark' ? '#f3f4f6' : '#374151',
                                            marginBottom: '8px',
                                            display: 'block'
                                        }}>
                                            Password
                                        </label>
                                        <div className="position-relative">
                                            <input
                                                id="password"
                                                onChange={handleChange}
                                                type={showPassword ? 'text' : 'password'}
                                                name='password'
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                placeholder='Enter your password'
                                                value={loginInfo.password}
                                                autoComplete="current-password"
                                                style={{
                                                    height: '55px',
                                                    paddingLeft: '50px',
                                                    paddingRight: '50px',
                                                    fontSize: '16px',
                                                    borderRadius: '15px',
                                                    border: errors.password 
                                                        ? '2px solid #ef4444' 
                                                        : theme === 'dark' 
                                                            ? '2px solid #374151' 
                                                            : '2px solid #e5e7eb',
                                                    background: theme === 'dark' ? '#1f2937' : '#f9fafb',
                                                    color: theme === 'dark' ? '#f3f4f6' : '#374151',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: 'none'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.background = theme === 'dark' ? '#2a3441' : '#ffffff';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = errors.password 
                                                        ? '#ef4444' 
                                                        : theme === 'dark' ? '#374151' : '#e5e7eb';
                                                    e.target.style.boxShadow = 'none';
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.background = theme === 'dark' ? '#1f2937' : '#f9fafb';
                                                }}
                                            />
                                            <i className="fas fa-lock" style={{
                                                position: 'absolute',
                                                left: '18px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#9ca3af',
                                                fontSize: '16px',
                                                pointerEvents: 'none'
                                            }}></i>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '15px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#9ca3af',
                                                    cursor: 'pointer',
                                                    fontSize: '16px',
                                                    padding: '5px',
                                                    transition: 'color 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.color = '#667eea';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.color = '#9ca3af';
                                                }}
                                            >
                                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <div style={{
                                                color: '#ef4444',
                                                fontSize: '0.875rem',
                                                marginTop: '5px',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <i className="fas fa-exclamation-circle me-2"></i>
                                                {errors.password}
                                            </div>
                                        )}
                                    </div>

                                    {/* Login Button */}
                                    <button 
                                        type='submit' 
                                        className="btn btn-primary w-100 py-3 mb-4 fw-semibold"
                                        disabled={loading}
                                        style={{ 
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            background: loading ? '#6c757d' : 'linear-gradient(45deg, #667eea, #764ba2)',
                                            border: 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-sign-in-alt me-2"></i>
                                                Sign In
                                            </>
                                        )}
                                    </button>

                                    {/* Signup Link */}
                                    <div className="text-center">
                                        <p className="mb-0 text-muted">
                                            Don't have an account? {' '}
                                            <Link 
                                                to="/signup" 
                                                className="text-decoration-none fw-semibold"
                                                style={{ color: '#667eea' }}
                                            >
                                                Create Account
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                        </div>
                        
                        {/* Footer */}
                        <div className="text-center mt-4">
                            <p style={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                marginBottom: '0',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i className="fas fa-shield-alt me-2"></i>
                                Your data is secure with TaskFlow
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

export default Login;