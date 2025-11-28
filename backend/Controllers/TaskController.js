const TaskModel = require("../Models/TaskModel");
const CategoryModel = require("../Models/CategoryModel");
const UserModel = require("../Models/User");



const createTask = async (req, res) => {
    try {
        const userId = req.userId || (req.user && (req.user._id || req.user.id));
        if (!userId) return res.status(401).json({ message: 'Unauthorized', success: false });
        
        const data = { ...req.body, userId };
        
        // Set completedAt if task is marked as done
        if (data.isDone) {
            data.completedAt = new Date();
        }
        
        const model = new TaskModel(data);
        await model.save();
        
        // Update user stats
        await UserModel.findByIdAndUpdate(userId, {
            $inc: { 'stats.totalTasksCreated': 1 },
            $set: { 'stats.lastActiveDate': new Date() }
        });
            // Send notification to user
            const { sendNotification } = require('../utils/notification');
            const user = await UserModel.findById(userId);
            if (user && user.preferences?.emailNotifications !== false) {
                sendNotification(user.email, 'Task Created', `Your task \"${model.taskName}\" was created.`);
            }
            // Push notification (device)
            try {
                const { sendPushNotification } = require('../utils/notification');
                if (user) {
                    sendPushNotification(user, 'Task Created', `"${model.taskName}" was created.`);
                }
            } catch (_) {}
        
        res.status(201)
            .json({ message: 'Task is created', success: true, data: model })
    } catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ message: 'Failed to create task', success: false });
    }
}

const fetchAllTasks = async (req, res) => {
    try {
        const userId = req.userId || (req.user && (req.user._id || req.user.id));
        if (!userId) return res.status(401).json({ message: 'Unauthorized', success: false });
        
        const { 
            priority, 
            category, 
            isDone,
            status,  // Also accept status parameter
            sortBy = 'createdAt', 
            sortOrder = 'desc',
            page = 1,
            limit = 50,
            search
        } = req.query;
        
        // Build filter object
        let filter = { userId };
        
        if (priority) filter.priority = priority;
        if (category) filter.category = category;
        // Accept both isDone and status parameters
        if (isDone !== undefined) filter.isDone = isDone === 'true';
        else if (status !== undefined && status !== '') filter.isDone = status === 'true';
        
        if (search) {
            filter.$or = [
                { taskName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const skip = (page - 1) * limit;
        
        const data = await TaskModel.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name email');
            
        const total = await TaskModel.countDocuments(filter);
        
        res.status(200)
            .json({ 
                message: 'All Tasks', 
                success: true, 
                data,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            })
    } catch (err) {
        console.error('Fetch tasks error:', err);
        res.status(500).json({ message: 'Failed to get all tasks', success: false });
    }
}

const updateTaskById = async (req, res) => {
    try {
        const userId = req.userId || (req.user && (req.user._id || req.user.id));
        if (!userId) return res.status(401).json({ message: 'Unauthorized', success: false });
        
        const id = req.params.id;
        const body = req.body;
        
        console.log('Update request - Task ID:', id, 'User ID:', userId, 'Body:', body);
        
        // Convert userId to ObjectId for proper matching
        const mongoose = require('mongoose');
        let userObjectId = userId;
        try {
            userObjectId = new mongoose.Types.ObjectId(userId);
        } catch (e) {
            console.log('userId conversion error:', e.message);
        }
        
        // Check if task belongs to user
        const existingTask = await TaskModel.findOne({ _id: id, userId: userObjectId });
        console.log('Existing task found:', existingTask ? 'Yes' : 'No', 'Task:', existingTask);
        
        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found', success: false });
        }
        
        // Handle completion status change
        if (body.isDone !== undefined) {
            // Ensure isDone is a boolean
            const isDoneValue = typeof body.isDone === 'string' ? body.isDone === 'true' : body.isDone;
            body.isDone = isDoneValue;
            
            console.log('isDone value:', isDoneValue, 'existing isDone:', existingTask.isDone);
            
            if (isDoneValue && !existingTask.isDone) {
                // Task is being completed
                body.completedAt = new Date();
                
                // Update user stats
                await UserModel.findByIdAndUpdate(userId, {
                    $inc: { 'stats.totalTasksCompleted': 1 },
                    $set: { 'stats.lastActiveDate': new Date() }
                });
                console.log('Task marked as completed');
            } else if (!isDoneValue && existingTask.isDone) {
                // Task is being uncompleted
                body.completedAt = null;
                
                // Update user stats
                await UserModel.findByIdAndUpdate(userId, {
                    $inc: { 'stats.totalTasksCompleted': -1 },
                    $set: { 'stats.lastActiveDate': new Date() }
                });
                console.log('Task marked as uncompleted');
            }
        }
        
        const obj = { $set: {...body}};
        console.log('Update object:', obj);
        
        const updatedTask = await TaskModel.findByIdAndUpdate(id, obj, { new: true });
        console.log('Updated task:', updatedTask);
        
        res.status(200)
            .json({message: 'Task Updated', success: true, data: updatedTask});
    } catch (err) {
        console.error('Update task error:', err);
        res.status(500).json({ message: 'Failed to update task', success: false });
    }
}

const deletetaskById = async (req, res) => {
    try {
        const userId = req.userId || (req.user && (req.user._id || req.user.id));
        if (!userId) return res.status(401).json({ message: 'Unauthorized', success: false });
        
        const id = req.params.id;
        
        // Check if task belongs to user and delete
        const deletedTask = await TaskModel.findOneAndDelete({ _id: id, userId });
        
        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found', success: false });
        }
        
        // Update user stats if completed task was deleted
        if (deletedTask.isDone) {
            await UserModel.findByIdAndUpdate(userId, {
                $inc: { 'stats.totalTasksCompleted': -1 }
            });
        }
        
        await UserModel.findByIdAndUpdate(userId, {
            $inc: { 'stats.totalTasksCreated': -1 },
            $set: { 'stats.lastActiveDate': new Date() }
        });
        
        res.status(200)
            .json({ message: 'Task is deleted', success: true })
    } catch (err) {
        console.error('Delete task error:', err);
        res.status(500).json({ message: 'Failed to delete task', success: false });
    }
}

// Get task analytics and statistics
const getTaskAnalytics = async (req, res) => {
    try {
        const userId = req.userId || (req.user && (req.user._id || req.user.id));
        if (!userId) return res.status(401).json({ message: 'Unauthorized', success: false });
        
        const { period = '7d' } = req.query; // 7d, 30d, 90d, 1y
        
        let dateFilter = {};
        const now = new Date();
        
        switch(period) {
            case '7d':
                dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
                break;
            case '30d':
                dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
                break;
            case '90d':
                dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
                break;
            case '1y':
                dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
                break;
            default:
                // Return all-time analytics if no period specified
                dateFilter = {};
                break;
        }
        
        // Convert userId to ObjectId for proper MongoDB matching
        const mongoose = require('mongoose');
        let userObjectId = userId;
        try {
            userObjectId = new mongoose.Types.ObjectId(userId);
        } catch (e) {
            console.log('userId is already in correct format or could not convert:', userId);
        }
        
        // Build filter
        const filter = { userId: userObjectId };
        if (Object.keys(dateFilter).length > 0) {
            filter.createdAt = dateFilter;
        }
        
        console.log('Analytics filter:', filter);
        console.log('Looking for tasks with userId:', userObjectId);
        
        // First, check all tasks for this user (regardless of date)
        const allUserTasks = await TaskModel.find({ userId: userObjectId });
        console.log('Total tasks found for user (all time):', allUserTasks.length);
        
        // Get filtered tasks
        const tasks = await TaskModel.find(filter);
        console.log('Total tasks found after date filter:', tasks.length);
        
        // Calculate analytics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.isDone).length;
        const pendingTasks = totalTasks - completedTasks;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Calculate average completion time
        const completedTasksWithTime = tasks.filter(task => task.completedAt && task.createdAt);
        let averageCompletionTime = 0;
        if (completedTasksWithTime.length > 0) {
            const totalTime = completedTasksWithTime.reduce((sum, task) => {
                return sum + (new Date(task.completedAt) - new Date(task.createdAt));
            }, 0);
            averageCompletionTime = totalTime / completedTasksWithTime.length;
        }
        
        // Get priority breakdown
        const priorityBreakdown = {};
        tasks.forEach(task => {
            const priority = task.priority || 'medium';
            priorityBreakdown[priority] = (priorityBreakdown[priority] || 0) + 1;
        });
        
        // Get category breakdown
        const categoryBreakdown = {};
        tasks.forEach(task => {
            const category = task.category || 'general';
            categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
        });
        
        const result = {
            totalTasks,
            completedTasks,
            pendingTasks,
            completionRate,
            averageCompletionTime,
            priorityBreakdown,
            categoryBreakdown
        };
        
        console.log('Analytics result:', result);
        
        res.status(200).json({
            message: 'Analytics retrieved successfully',
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ message: 'Failed to get analytics', success: false, error: err.message });
    }
};

// Get tasks by due date (for calendar view)
const getTasksByDateRange = async (req, res) => {
    try {
        const userId = req.userId || (req.user && (req.user._id || req.user.id));
        if (!userId) return res.status(401).json({ message: 'Unauthorized', success: false });
        
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ 
                message: 'Start date and end date are required', 
                success: false 
            });
        }
        
        const tasks = await TaskModel.find({
            userId,
            dueDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).sort({ dueDate: 1 });
        
        res.status(200).json({
            message: 'Tasks retrieved successfully',
            success: true,
            data: tasks
        });
    } catch (err) {
        console.error('Date range tasks error:', err);
        res.status(500).json({ message: 'Failed to get tasks by date range', success: false });
    }
};

// Toggle subtask completion
const toggleSubtask = async (req, res) => {
    try {
        const userId = req.userId || (req.user && (req.user._id || req.user.id));
        if (!userId) return res.status(401).json({ message: 'Unauthorized', success: false });
        
        const { taskId, subtaskId } = req.params;
        
        const task = await TaskModel.findOne({ _id: taskId, userId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found', success: false });
        }
        
        const subtask = task.subtasks.id(subtaskId);
        if (!subtask) {
            return res.status(404).json({ message: 'Subtask not found', success: false });
        }
        
        subtask.completed = !subtask.completed;
        await task.save();
        
        res.status(200).json({
            message: 'Subtask updated successfully',
            success: true,
            data: task
        });
    } catch (err) {
        console.error('Toggle subtask error:', err);
        res.status(500).json({ message: 'Failed to toggle subtask', success: false });
    }
};

// Add subtask to existing task
const addSubtask = async (req, res) => {
    try {
        const userId = req.userId || (req.user && (req.user._id || req.user.id));
        if (!userId) return res.status(401).json({ message: 'Unauthorized', success: false });
        
        const { taskId } = req.params;
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ message: 'Subtask text is required', success: false });
        }
        
        const task = await TaskModel.findOne({ _id: taskId, userId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found', success: false });
        }
        
        task.subtasks.push({ text, completed: false });
        await task.save();
        
        res.status(201).json({
            message: 'Subtask added successfully',
            success: true,
            data: task
        });
    } catch (err) {
        console.error('Add subtask error:', err);
        res.status(500).json({ message: 'Failed to add subtask', success: false });
    }
};

module.exports = {
    createTask,
    fetchAllTasks,
    updateTaskById,
    deletetaskById,
    getTaskAnalytics,
    getTasksByDateRange,
    toggleSubtask,
    addSubtask
}