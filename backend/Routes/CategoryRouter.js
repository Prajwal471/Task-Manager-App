const express = require('express');
const { 
    createCategory, 
    getUserCategories, 
    updateCategory, 
    deleteCategory 
} = require('../Controllers/CategoryController');
const ensureAuthenticated = require('../Middlewares/Auth');

const router = express.Router();

// Create new category
router.post('/', ensureAuthenticated, createCategory);

// Get all categories for user
router.get('/', ensureAuthenticated, getUserCategories);

// Update category
router.put('/:id', ensureAuthenticated, updateCategory);

// Delete category
router.delete('/:id', ensureAuthenticated, deleteCategory);

module.exports = router;