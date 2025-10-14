const TaskModel = require("../Models/TaskModel");
const CategoryModel = require("../Models/CategoryModel");
const UserModel = require("../Models/User");
const jwt = require('jsonwebtoken');



const createTask = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;
        
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
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;
        
        const { 
            priority, 
            category, 
            isDone, 
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
        if (isDone !== undefined) filter.isDone = isDone === 'true';
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
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;
        
        const id = req.params.id;
        const body = req.body;
        
        // Check if task belongs to user
        const existingTask = await TaskModel.findOne({ _id: id, userId });
        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found', success: false });
        }
        
        // Handle completion status change
        if (body.isDone !== undefined) {
            if (body.isDone && !existingTask.isDone) {
                // Task is being completed
                body.completedAt = new Date();
                
                // Update user stats
                await UserModel.findByIdAndUpdate(userId, {
                    $inc: { 'stats.totalTasksCompleted': 1 },
                    $set: { 'stats.lastActiveDate': new Date() }
                });
            } else if (!body.isDone && existingTask.isDone) {
                // Task is being uncompleted
                body.completedAt = null;
                
                // Update user stats
                await UserModel.findByIdAndUpdate(userId, {
                    $inc: { 'stats.totalTasksCompleted': -1 },
                    $set: { 'stats.lastActiveDate': new Date() }
                });
            }
        }
        
        const obj = { $set: {...body}};
        const updatedTask = await TaskModel.findByIdAndUpdate(id, obj, { new: true });
        
        res.status(200)
            .json({message: 'Task Updated', success: true, data: updatedTask});
    } catch (err) {
        console.error('Update task error:', err);
        res.status(500).json({ message: 'Failed to update task', success: false });
    }
}

const deletetaskById = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;
        
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
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;
        
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
        }
        
        const analytics = await TaskModel.aggregate([
            { $match: { userId: decoded._id, createdAt: dateFilter } },
            {
                $group: {
                    _id: null,
                    totalTasks: { $sum: 1 },
                    completedTasks: { $sum: { $cond: ["$isDone", 1, 0] } },
                    pendingTasks: { $sum: { $cond: ["$isDone", 0, 1] } },
                    averageCompletionTime: {
                        $avg: {
                            $cond: [
                                "$completedAt",
                                { $subtract: ["$completedAt", "$createdAt"] },
                                null
                            ]
                        }
                    },
                    priorityBreakdown: {
                        $push: "$priority"
                    },
                    categoryBreakdown: {
                        $push: "$category"
                    }
                }
            }
        ]);
        
        const result = analytics[0] || {
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            averageCompletionTime: 0,
            priorityBreakdown: [],
            categoryBreakdown: []
        };
        
        // Calculate completion rate
        result.completionRate = result.totalTasks > 0 ? 
            Math.round((result.completedTasks / result.totalTasks) * 100) : 0;
        
        res.status(200).json({
            message: 'Analytics retrieved successfully',
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ message: 'Failed to get analytics', success: false });
    }
};

// Get tasks by due date (for calendar view)
const getTasksByDateRange = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;
        
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
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;
        
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
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;
        
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