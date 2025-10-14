const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserModel = require("../Models/User");
const { initializeDefaultCategories } = require('./CategoryController');


// Password strength validation
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
        errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
        errors.push('Password must contain at least one special character');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Name, email, and password are required', 
                success: false 
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Please provide a valid email address', 
                success: false 
            });
        }
        
        // Simplified password validation - just check minimum length
        if (password.length < 4) {
            return res.status(400).json({ 
                message: 'Password must be at least 4 characters long', 
                success: false 
            });
        }
        
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409)
                .json({ message: 'User already exists, you can login', success: false });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Ensure we set a unique username (some deployments have a unique index on username)
        const baseUsername = (email.split('@')[0] || name.replace(/\s+/g, '')).toLowerCase().replace(/[^a-z0-9]/g, '');
        let username = baseUsername || `user${Date.now()}`;
        // Try to find a unique username with a numeric suffix
        for (let i = 0; i < 6; i++) {
            const exists = await UserModel.findOne({ username });
            if (!exists) break;
            // append random 4 digits
            username = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const userModel = new UserModel({ 
            name, 
            email, 
            username,
            password: hashedPassword,
            isEmailVerified: true, // Auto-verify emails to remove limits
            stats: {
                totalTasksCreated: 0,
                totalTasksCompleted: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastActiveDate: new Date()
            }
        });
        
        await userModel.save();
        
        // Initialize default categories for new user
        await initializeDefaultCategories(userModel._id);
        
        res.status(201)
            .json({
                message: "Account created successfully! You can now login.",
                success: true,
                userId: userModel._id
            })
    } catch (err) {
        console.error('Signup error details:', {
            message: err.message,
            stack: err.stack,
            name: err.name,
            code: err.code
        });
        res.status(500)
            .json({
                message: "Internal server error",
                success: false,
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            })
    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required', 
                success: false 
            });
        }
        
        const user = await UserModel.findOne({ email });
        const errorMsg = 'Invalid email or password';
        
        if (!user) {
            return res.status(403)
                .json({ message: errorMsg, success: false });
        }
        
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403)
                .json({ message: errorMsg, success: false });
        }
        
        // Update last login
        await UserModel.findByIdAndUpdate(user._id, {
            lastLogin: new Date(),
            'stats.lastActiveDate': new Date()
        });
        
        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.status(200)
            .json({
                message: "Login successful",
                success: true,
                jwtToken,
                email,
                name: user.name,
                userId: user._id,
                theme: user.theme,
                preferences: user.preferences
            })
    } catch (err) {
        console.error('Login error:', err);
        res.status(500)
            .json({
                message: "Internal server error",
                success: false
            })
    }
}

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;
        
        const user = await UserModel.findById(userId).select('-password -emailVerificationToken -passwordResetToken');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        
        res.status(200).json({
            message: 'Profile retrieved successfully',
            success: true,
            data: user
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ message: 'Failed to get profile', success: false });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;
        
        const { name, theme, timezone, preferences } = req.body;
        
        const updateData = {};
        if (name) updateData.name = name;
        if (theme) updateData.theme = theme;
        if (timezone) updateData.timezone = timezone;
        if (preferences) updateData.preferences = { ...preferences };
        
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password -emailVerificationToken -passwordResetToken');
        
        res.status(200).json({
            message: 'Profile updated successfully',
            success: true,
            data: updatedUser
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Failed to update profile', success: false });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;
        
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Current password and new password are required',
                success: false
            });
        }
        
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                message: 'Current password is incorrect',
                success: false
            });
        }
        
        // Simplified password validation - just check minimum length
        if (newPassword.length < 4) {
            return res.status(400).json({
                message: 'New password must be at least 4 characters long',
                success: false
            });
        }
        
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        
        await UserModel.findByIdAndUpdate(userId, {
            password: hashedNewPassword
        });
        
        res.status(200).json({
            message: 'Password changed successfully',
            success: true
        });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ message: 'Failed to change password', success: false });
    }
};

module.exports = {
    signup,
    login,
    getUserProfile,
    updateUserProfile,
    changePassword
}