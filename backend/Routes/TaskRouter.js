const { createTask, fetchAllTasks, updateTaskById, deletetaskById } = require('../Controllers/TaskController');

const router = require('express').Router();
// // To get all thhe tasks
router.get('/', fetchAllTasks);

// To create task we need a post method
router.post('/', createTask);

// To update task we need a put method
router.put('/:id', updateTaskById);

// To delete task we need a post method
router.delete('/:id', deletetaskById);

module.exports = router;