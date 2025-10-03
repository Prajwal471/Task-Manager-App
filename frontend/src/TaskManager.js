import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleSuccess } from './utils';
import { 
    FaCheck, FaPencilAlt, FaPlus, FaSearch, FaTrash, FaCalendarAlt, 
    FaFlag, FaTag, FaSun, FaMoon, FaChartBar,
    FaSortAmountDown, FaSortAmountUp, FaList, FaTh, FaUser,
    FaDownload, FaFilePdf, FaFileCsv, FaFileCode, FaCog
} from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';

import { CreateTask, DeleteTaskById, GetAllTasks, UpdateTaskById, GetTaskAnalytics, GetUserCategories, CreateCategory, UpdateCategory, DeleteCategory } from './api';
import { notify } from './utils';
import UserProfile from './components/UserProfile';
import { exportTasksToPDF, exportTasksToCSV, exportTasksToJSON } from './utils/exportUtils';

function TaskManager() {
    
    const [tasks, setTasks] = useState([]);
    const [updateTask, setUpdateTask] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState('');
    const [theme, setTheme] = useState('light');
    const [viewMode, setViewMode] = useState('list');
    
    // New state for enhanced features
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        priority: '',
        category: '',
        status: '',
        search: ''
    });
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    
    // Category form state
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        color: '#007bff',
        icon: 'folder'
    });
    const [updateCategory, setUpdateCategory] = useState(null);
    
    // Task form state
    const [taskForm, setTaskForm] = useState({
        taskName: '',
        description: '',
        priority: 'medium',
        category: 'general',
        dueDate: '',
        tags: []
    });
   
    const navigate = useNavigate();
    
    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser'));
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (selectedTheme) => {
        document.body.setAttribute('data-bs-theme', selectedTheme);
        localStorage.setItem('theme', selectedTheme);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
    };

    const handleLogout = (e) => {
        // Create a custom confirmation modal
        const isConfirmed = window.confirm('Are you sure you want to logout?');
        
        if (isConfirmed) {
            localStorage.removeItem('token');
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('theme');
            handleSuccess('Logged out successfully!');
            setTimeout(() => {
                navigate('/login');
            }, 1000)
        }
    }

    const fetchCategories = useCallback(async () => {
        try {
            const response = await GetUserCategories();
            if (response.success) {
                setCategories(response.data);
            }
        } catch (err) {
            console.error('Fetch categories error:', err);
        }
    }, []);

    const handleAddCategory = async () => {
        try {
            const { success, message } = await CreateCategory(categoryForm);
            if (success) {
                notify(message, 'success');
                fetchCategories(); // Refresh categories list
                resetCategoryForm();
                setShowCategoryModal(false);
            } else {
                notify(message, 'error');
            }
        } catch (err) {
            console.error('Add category error:', err);
            notify('Failed to create category', 'error');
        }
    };

    const handleUpdateCategory = async () => {
        try {
            const { success, message } = await UpdateCategory(updateCategory._id, categoryForm);
            if (success) {
                notify(message, 'success');
                fetchCategories(); // Refresh categories list
                resetCategoryForm();
                setShowCategoryModal(false);
            } else {
                notify(message, 'error');
            }
        } catch (err) {
            console.error('Update category error:', err);
            notify('Failed to update category', 'error');
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const { success, message } = await DeleteCategory(categoryId);
                if (success) {
                    notify(message, 'success');
                    fetchCategories(); // Refresh categories list
                } else {
                    notify(message, 'error');
                }
            } catch (err) {
                console.error('Delete category error:', err);
                notify('Failed to delete category', 'error');
            }
        }
    };

    const handleCategorySubmit = () => {
        if (updateCategory) {
            handleUpdateCategory();
        } else {
            handleAddCategory();
        }
    };

    const resetCategoryForm = () => {
        setCategoryForm({
            name: '',
            color: '#007bff',
            icon: 'folder'
        });
        setUpdateCategory(null);
    };

    const openEditCategoryModal = (category) => {
        setUpdateCategory(category);
        setCategoryForm({
            name: category.name,
            color: category.color,
            icon: category.icon
        });
        setShowCategoryModal(true);
    };

    const fetchAnalytics = useCallback(async () => {
        try {
            const response = await GetTaskAnalytics();
            if (response.success) {
                setAnalytics(response.data);
            }
        } catch (err) {
            console.error('Fetch analytics error:', err);
        }
    }, []);

    const handleTask = async () => {
        if (updateTask && taskForm.taskName) {
            const obj = {
                taskName: taskForm.taskName,
                description: taskForm.description,
                priority: taskForm.priority,
                category: taskForm.category,
                dueDate: taskForm.dueDate || null,
                isDone: updateTask.isDone,
                _id: updateTask._id
            };
            handleUpdateItem(obj);
        } else if (updateTask === null && taskForm.taskName) {
            handleAddTask();
        }
        resetTaskForm();
        setShowAddTaskModal(false);
    }

    const resetTaskForm = () => {
        setTaskForm({
            taskName: '',
            description: '',
            priority: 'medium',
            category: 'general',
            dueDate: '',
            tags: []
        });
        setUpdateTask(null);
    };

    const handleAddTask = async () => {
        try {
            const { success, message } = await CreateTask(taskForm);
            if (success) {
                notify(message, 'success');
            } else {
                notify(message, 'error');
            }
            fetchAllTasks();
        } catch (err) {
            console.error(err);
            notify('Failed to create task', 'error');
        }
    }

    const fetchAllTasks = useCallback(async () => {
        try {
            const queryParams = new URLSearchParams({
                sortBy,
                sortOrder,
                ...filters
            });
            
            const response = await GetAllTasks(`?${queryParams}`);
            const data = response?.data || [];
            setTasks(data);
        } catch (err) {
            console.error(err);
            notify('Failed to fetch tasks', 'error');
            // Set empty array on error to prevent undefined errors
            setTasks([]);
        }
    }, [sortBy, sortOrder, filters]);
    
    useEffect(() => {
        fetchAllTasks();
        fetchCategories();
        if (showAnalytics) {
            fetchAnalytics();
        }
    }, [fetchAllTasks, fetchCategories, fetchAnalytics, showAnalytics]);


    const handleDeleteTask = async (id) => {
        try {
            const { success, message } = await DeleteTaskById(id);
            if (success) {
                notify(message, 'success');
            } else {
                notify(message, 'error');
            }
            fetchAllTasks();
        } catch (err) {
            console.error(err);
            notify('Failed to delete task', 'error');
        }
    }

    const handleCheckAndUncheck = async (item) => {
        const { _id, isDone, taskName } = item;
        const obj = {
            taskName,
            isDone: !isDone
        };
        try {
            const { success, message } = await UpdateTaskById(_id, obj);
            if (success) {
                notify(message, 'success');
            } else {
                notify(message, 'error');
            }
            fetchAllTasks();
        } catch (err) {
            console.error(err);
            notify('Failed to update task', 'error');
        }
    }

    const handleUpdateItem = async (item) => {
        const { _id, isDone, taskName, description, priority, category, dueDate } = item;
        const obj = {
            taskName,
            description,
            priority,
            category,
            dueDate,
            isDone
        };
        try {
            const { success, message } = await UpdateTaskById(_id, obj);
            if (success) {
                notify(message, 'success');
            } else {
                notify(message, 'error');
            }
            fetchAllTasks();
        } catch (err) {
            console.error(err);
            notify('Failed to update task', 'error');
        }
    }

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setFilters(prev => ({ ...prev, search: term }));
    }

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'high': return 'danger';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'secondary';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString();
        }
    };

    const isOverdue = (dueDate) => {
        if (!dueDate || !tasks || !Array.isArray(tasks)) return false;
        return new Date(dueDate) < new Date() && !tasks.find(task => task.dueDate === dueDate)?.isDone;
    };

    const openEditModal = (task) => {
        setUpdateTask(task);
        setTaskForm({
            taskName: task.taskName,
            description: task.description || '',
            priority: task.priority || 'medium',
            category: task.category || 'general',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
            tags: task.tags || []
        });
        setShowAddTaskModal(true);
    };

    const handleExport = async (format) => {
        try {
            if (!tasks || tasks.length === 0) {
                notify('No tasks to export', 'warning');
                return;
            }
            
            let success = false;
            const filename = `tasks_${new Date().toISOString().split('T')[0]}`;
            
            switch(format) {
                case 'pdf':
                    success = await exportTasksToPDF(tasks, 'My Tasks');
                    break;
                case 'csv':
                    success = exportTasksToCSV(tasks, filename);
                    break;
                case 'json':
                    success = exportTasksToJSON(tasks, filename);
                    break;
                default:
                    notify('Invalid export format', 'error');
                    return;
            }
            
            if (success) {
                notify(`Tasks exported as ${format.toUpperCase()} successfully!`, 'success');
            } else {
                notify(`Failed to export tasks as ${format.toUpperCase()}`, 'error');
            }
        } catch (error) {
            console.error('Export error:', error);
            notify('Export failed', 'error');
        }
    };
    return (
        <div className={`task-manager-container ${theme}`} data-bs-theme={theme}>
            {/* Header */}
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        {/* Main Navigation */}
                        <nav className="navbar navbar-expand-lg mb-4" style={{ 
                            background: theme === 'dark' ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '15px',
                            border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb'
                        }}>
                            <div className="container-fluid">
                                <div className="d-flex justify-content-between align-items-center w-100">
                                    {/* Brand Logo */}
                                    <div className="d-flex align-items-center">
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)'
                                        }}>
                                            <i className="fas fa-stream" style={{ color: 'white', fontSize: '18px' }}></i>
                                        </div>
                                        <span style={{
                                            fontSize: '1.4rem',
                                            fontWeight: '700',
                                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            letterSpacing: '0.5px'
                                        }}>TaskFlow</span>
                                    </div>
                                    <div className="navbar-nav ms-auto d-flex flex-row align-items-center">
                                        <span className="nav-item me-3">Welcome, {loggedInUser}!</span>
                                        <button 
                                            className="btn btn-outline-secondary btn-sm me-2"
                                            onClick={() => setShowProfile(true)}
                                            title="User Profile"
                                        >
                                            <FaUser />
                                        </button>
                                        <button 
                                            className="btn btn-outline-secondary btn-sm me-2"
                                            onClick={toggleTheme}
                                            title="Toggle Theme"
                                        >
                                            {theme === 'light' ? <FaMoon /> : <FaSun />}
                                        </button>
                                        <button 
                                            className="btn btn-outline-info btn-sm me-2"
                                            onClick={() => {
                                                setShowAnalytics(!showAnalytics);
                                                if (!showAnalytics) fetchAnalytics();
                                            }}
                                            title="View Analytics"
                                        >
                                            <FaChartBar />
                                        </button>
                                        <button 
                                            className="btn btn-outline-secondary btn-sm me-2"
                                            onClick={() => {
                                                resetCategoryForm();
                                                setShowCategoryModal(true);
                                            }}
                                            title="Manage Categories"
                                        >
                                            <FaCog />
                                        </button>
                                        <div className="btn-group me-2">
                                            <button 
                                                className="btn btn-outline-success btn-sm dropdown-toggle"
                                                type="button"
                                                data-bs-toggle="dropdown"
                                                title="Export Tasks"
                                            >
                                                <FaDownload />
                                            </button>
                                            <ul className="dropdown-menu">
                                                <li>
                                                    <button 
                                                        className="dropdown-item"
                                                        onClick={() => handleExport('pdf')}
                                                    >
                                                        <FaFilePdf className="me-2" />PDF
                                                    </button>
                                                </li>
                                                <li>
                                                    <button 
                                                        className="dropdown-item"
                                                        onClick={() => handleExport('csv')}
                                                    >
                                                        <FaFileCsv className="me-2" />CSV
                                                    </button>
                                                </li>
                                                <li>
                                                    <button 
                                                        className="dropdown-item"
                                                        onClick={() => handleExport('json')}
                                                    >
                                                        <FaFileCode className="me-2" />JSON
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                        <button 
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={handleLogout}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>

                {/* Analytics Panel */}
                {showAnalytics && analytics && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h5>Task Analytics</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <h3 className="text-primary">{analytics.totalTasks}</h3>
                                                <p>Total Tasks</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <h3 className="text-success">{analytics.completedTasks}</h3>
                                                <p>Completed</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <h3 className="text-warning">{analytics.pendingTasks}</h3>
                                                <p>Pending</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <h3 className="text-info">{analytics.completionRate}%</h3>
                                                <p>Completion Rate</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    {/* Add Task Button */}
                                    <div className="col-md-2">
                                        <button
                                            className="btn btn-primary w-100"
                                            onClick={() => {
                                                resetTaskForm();
                                                setShowAddTaskModal(true);
                                            }}
                                        >
                                            <FaPlus className="me-2" /> Add Task
                                        </button>
                                    </div>

                                    {/* Search */}
                                    <div className="col-md-3">
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <FaSearch />
                                            </span>
                                            <input
                                                onChange={handleSearch}
                                                className="form-control"
                                                type="text"
                                                placeholder="Search tasks..."
                                            />
                                        </div>
                                    </div>

                                    {/* Filters */}
                                    <div className="col-md-2">
                                        <select 
                                            className="form-select"
                                            value={filters.priority}
                                            onChange={(e) => setFilters(prev => ({...prev, priority: e.target.value}))}
                                        >
                                            <option value="">All Priorities</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>

                                    <div className="col-md-2">
                                        <select 
                                            className="form-select"
                                            value={filters.category}
                                            onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
                                        >
                                            <option value="">All Categories</option>
                                            {categories && categories.map(cat => (
                                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-2">
                                        <select 
                                            className="form-select"
                                            value={filters.status}
                                            onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                                        >
                                            <option value="">All Status</option>
                                            <option value="false">Pending</option>
                                            <option value="true">Completed</option>
                                        </select>
                                    </div>

                                    {/* View Mode */}
                                    <div className="col-md-1">
                                        <div className="btn-group">
                                            <button 
                                                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setViewMode('list')}
                                                title="List View"
                                            >
                                                <FaList />
                                            </button>
                                            <button 
                                                className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setViewMode('grid')}
                                                title="Grid View"
                                            >
                                                <FaTh />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="row mt-3">
                                    <div className="col-md-4">
                                        <div className="d-flex align-items-center">
                                            <label className="me-2">Sort by:</label>
                                            <select 
                                                className="form-select form-select-sm me-2"
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                            >
                                                <option value="createdAt">Date Created</option>
                                                <option value="dueDate">Due Date</option>
                                                <option value="priority">Priority</option>
                                                <option value="taskName">Name</option>
                                            </select>
                                            <button 
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                                title="Toggle Sort Order"
                                            >
                                                {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks Display */}
                <div className="row">
                    <div className="col-12">
                        {!tasks || tasks.length === 0 ? (
                            <div className="text-center py-5">
                                <h4>No tasks found</h4>
                                <p>Create your first task to get started!</p>
                            </div>
                        ) : viewMode === 'list' ? (
                            // List View
                            <div className="card">
                                <div className="card-body">
                                    {tasks && tasks.map((item) => (
                                        <div key={item._id} className={`task-item border rounded p-3 mb-3 ${item.isDone ? 'bg-light' : ''} ${isOverdue(item.dueDate) ? 'border-danger' : ''}`}>
                                            <div className="row align-items-center">
                                                <div className="col-md-6">
                                                    <div className="d-flex align-items-center">
                                                        <button
                                                            onClick={() => handleCheckAndUncheck(item)}
                                                            className={`btn btn-sm me-3 ${item.isDone ? 'btn-success' : 'btn-outline-success'}`}
                                                            type="button"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                        <div>
                                                            <h6 className={`mb-1 ${item.isDone ? 'text-decoration-line-through text-muted' : ''}`}>
                                                                {item.taskName}
                                                            </h6>
                                                            {item.description && (
                                                                <small className="text-muted">{item.description}</small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="d-flex flex-wrap gap-1">
                                                        <span className={`badge bg-${getPriorityColor(item.priority)}`}>
                                                            <FaFlag className="me-1" />{item.priority}
                                                        </span>
                                                        {item.category && (
                                                            <span className="badge bg-info">
                                                                <FaTag className="me-1" />{item.category}
                                                            </span>
                                                        )}
                                                        {item.dueDate && (
                                                            <span className={`badge ${isOverdue(item.dueDate) ? 'bg-danger' : 'bg-secondary'}`}>
                                                                <FaCalendarAlt className="me-1" />{formatDate(item.dueDate)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="d-flex justify-content-end">
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="btn btn-outline-primary btn-sm me-2"
                                                            type="button"
                                                        >
                                                            <FaPencilAlt />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTask(item._id)}
                                                            className="btn btn-outline-danger btn-sm"
                                                            type="button"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Grid View
                            <div className="row">
                                {tasks && tasks.map((item) => (
                                    <div key={item._id} className="col-md-4 mb-4">
                                        <div className={`card h-100 ${item.isDone ? 'bg-light' : ''} ${isOverdue(item.dueDate) ? 'border-danger' : ''}`}>
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 className={`card-title ${item.isDone ? 'text-decoration-line-through text-muted' : ''}`}>
                                                        {item.taskName}
                                                    </h6>
                                                    <button
                                                        onClick={() => handleCheckAndUncheck(item)}
                                                        className={`btn btn-sm ${item.isDone ? 'btn-success' : 'btn-outline-success'}`}
                                                        type="button"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                </div>
                                                {item.description && (
                                                    <p className="card-text text-muted small">{item.description}</p>
                                                )}
                                                <div className="d-flex flex-wrap gap-1 mb-3">
                                                    <span className={`badge bg-${getPriorityColor(item.priority)}`}>
                                                        {item.priority}
                                                    </span>
                                                    {item.category && (
                                                        <span className="badge bg-info">{item.category}</span>
                                                    )}
                                                    {item.dueDate && (
                                                        <span className={`badge ${isOverdue(item.dueDate) ? 'bg-danger' : 'bg-secondary'}`}>
                                                            {formatDate(item.dueDate)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="d-flex justify-content-end">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="btn btn-outline-primary btn-sm me-2"
                                                        type="button"
                                                    >
                                                        <FaPencilAlt />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTask(item._id)}
                                                        className="btn btn-outline-danger btn-sm"
                                                        type="button"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Task Modal */}
            {showAddTaskModal && (
                <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {updateTask ? 'Edit Task' : 'Add New Task'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => {
                                        setShowAddTaskModal(false);
                                        resetTaskForm();
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label className="form-label">Task Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={taskForm.taskName}
                                            onChange={(e) => setTaskForm(prev => ({...prev, taskName: e.target.value}))}
                                            placeholder="Enter task name"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={taskForm.description}
                                            onChange={(e) => setTaskForm(prev => ({...prev, description: e.target.value}))}
                                            placeholder="Enter task description"
                                        ></textarea>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Priority</label>
                                                <select 
                                                    className="form-select"
                                                    value={taskForm.priority}
                                                    onChange={(e) => setTaskForm(prev => ({...prev, priority: e.target.value}))}
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Category</label>
                                                <select 
                                                    className="form-select"
                                                    value={taskForm.category}
                                                    onChange={(e) => setTaskForm(prev => ({...prev, category: e.target.value}))}
                                                >
                                                    <option value="general">General</option>
                                                    {categories && categories.map(cat => (
                                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Due Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={taskForm.dueDate}
                                                    onChange={(e) => setTaskForm(prev => ({...prev, dueDate: e.target.value}))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowAddTaskModal(false);
                                        resetTaskForm();
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={handleTask}
                                    disabled={!taskForm.taskName.trim()}
                                >
                                    {updateTask ? 'Update Task' : 'Create Task'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Profile Modal */}
            <UserProfile 
                isOpen={showProfile} 
                onClose={() => setShowProfile(false)} 
            />

            {/* Category Management Modal */}
            {showCategoryModal && (
                <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Manage Categories</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => {
                                        setShowCategoryModal(false);
                                        resetCategoryForm();
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {/* Add/Edit Category Form */}
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            {updateCategory ? 'Edit Category' : 'Add New Category'}
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Category Name *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={categoryForm.name}
                                                        onChange={(e) => setCategoryForm(prev => ({...prev, name: e.target.value}))}
                                                        placeholder="Enter category name"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-3">
                                                    <label className="form-label">Color</label>
                                                    <input
                                                        type="color"
                                                        className="form-control form-control-color"
                                                        value={categoryForm.color}
                                                        onChange={(e) => setCategoryForm(prev => ({...prev, color: e.target.value}))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-3">
                                                    <label className="form-label">Icon</label>
                                                    <select 
                                                        className="form-select"
                                                        value={categoryForm.icon}
                                                        onChange={(e) => setCategoryForm(prev => ({...prev, icon: e.target.value}))}
                                                    >
                                                        <option value="folder">📁 Folder</option>
                                                        <option value="work">💼 Work</option>
                                                        <option value="personal">👤 Personal</option>
                                                        <option value="shopping">🛍️ Shopping</option>
                                                        <option value="health">🏥 Health</option>
                                                        <option value="education">📚 Education</option>
                                                        <option value="finance">💰 Finance</option>
                                                        <option value="home">🏠 Home</option>
                                                        <option value="travel">✈️ Travel</option>
                                                        <option value="hobby">🎨 Hobby</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button 
                                                type="button" 
                                                className="btn btn-primary"
                                                onClick={handleCategorySubmit}
                                                disabled={!categoryForm.name.trim()}
                                            >
                                                {updateCategory ? 'Update Category' : 'Add Category'}
                                            </button>
                                            {updateCategory && (
                                                <button 
                                                    type="button" 
                                                    className="btn btn-secondary"
                                                    onClick={resetCategoryForm}
                                                >
                                                    Cancel Edit
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Categories List */}
                                <div className="card">
                                    <div className="card-header">
                                        <h6 className="mb-0">Your Categories</h6>
                                    </div>
                                    <div className="card-body">
                                        {categories && categories.length === 0 ? (
                                            <div className="text-center py-3">
                                                <p className="text-muted">No categories created yet. Add your first category above!</p>
                                            </div>
                                        ) : (
                                            <div className="row">
                                                {categories && categories.map((category) => (
                                                    <div key={category._id} className="col-md-6 mb-3">
                                                        <div className="card border" style={{borderColor: category.color}}>
                                                            <div className="card-body p-3">
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div className="d-flex align-items-center">
                                                                        <span className="me-2" style={{fontSize: '1.2em'}}>
                                                                            {category.icon === 'folder' && '📁'}
                                                                            {category.icon === 'work' && '💼'}
                                                                            {category.icon === 'personal' && '👤'}
                                                                            {category.icon === 'shopping' && '🛍️'}
                                                                            {category.icon === 'health' && '🏥'}
                                                                            {category.icon === 'education' && '📚'}
                                                                            {category.icon === 'finance' && '💰'}
                                                                            {category.icon === 'home' && '🏠'}
                                                                            {category.icon === 'travel' && '✈️'}
                                                                            {category.icon === 'hobby' && '🎨'}
                                                                        </span>
                                                                        <div>
                                                                            <h6 className="mb-0" style={{color: category.color}}>
                                                                                {category.name}
                                                                            </h6>
                                                                            <small className="text-muted">
                                                                                Created {new Date(category.createdAt).toLocaleDateString()}
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                    <div className="d-flex gap-1">
                                                                        <button
                                                                            className="btn btn-outline-primary btn-sm"
                                                                            onClick={() => openEditCategoryModal(category)}
                                                                            title="Edit Category"
                                                                        >
                                                                            <FaPencilAlt />
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-outline-danger btn-sm"
                                                                            onClick={() => handleDeleteCategory(category._id)}
                                                                            title="Delete Category"
                                                                        >
                                                                            <FaTrash />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowCategoryModal(false);
                                        resetCategoryForm();
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Container */}
            <ToastContainer
                position='top-right'
                autoClose={3000}
                hideProgressBar={false}
            />
        </div>
    )
}

export default TaskManager;