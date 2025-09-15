const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default: ''
    },
    theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
    },
    timezone: {
        type: String,
        default: 'UTC'
    },
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        defaultTaskPriority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        taskViewMode: {
            type: String,
            enum: ['list', 'grid', 'calendar'],
            default: 'list'
        }
    },
    stats: {
        totalTasksCreated: {
            type: Number,
            default: 0
        },
        totalTasksCompleted: {
            type: Number,
            default: 0
        },
        currentStreak: {
            type: Number,
            default: 0
        },
        longestStreak: {
            type: Number,
            default: 0
        },
        lastActiveDate: {
            type: Date,
            default: Date.now
        }
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    }
}, {
    timestamps: true
});

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;