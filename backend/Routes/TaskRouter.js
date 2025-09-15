const { createTask, fetchAllTasks, updateTaskById, deletetaskById, getTaskAnalytics, getTasksByDateRange, toggleSubtask, addSubtask } = require('../Controllers/TaskController');
const ensureAuthenticated = require('../Middlewares/Auth');

const router = require('express').Router();

// Apply authentication middleware to all routes
router.use(ensureAuthenticated);

// To get all the tasks
router.get('/', fetchAllTasks);

// To create task we need a post method
router.post('/', createTask);

// To update task we need a put method
router.put('/:id', updateTaskById);

// To delete task we need a delete method
router.delete('/:id', deletetaskById);

// Get task analytics
router.get('/analytics', getTaskAnalytics);

// Get tasks by date range
router.get('/date-range', getTasksByDateRange);

// Add subtask to existing task
router.post('/:taskId/subtasks', addSubtask);

// Toggle subtask completion
router.patch('/:taskId/subtasks/:subtaskId/toggle', toggleSubtask);

module.exports = router;