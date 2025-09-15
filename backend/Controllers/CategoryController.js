const CategoryModel = require("../Models/CategoryModel");
const jwt = require('jsonwebtoken');

// Create a new category
const createCategory = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;
        
        const { name, color, icon } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Category name is required', success: false });
        }
        
        // Check if category already exists for this user
        const existingCategory = await CategoryModel.findOne({ name, userId });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists', success: false });
        }
        
        const category = new CategoryModel({
            name,
            color: color || '#6c757d',
            icon: icon || 'folder',
            userId
        });
        
        await category.save();
        
        res.status(201).json({
            message: 'Category created successfully',
            success: true,
            data: category
        });
    } catch (err) {
        console.error('Create category error:', err);
        res.status(500).json({ message: 'Failed to create category', success: false });
    }
};

// Get all categories for user
const getUserCategories = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;
        
        const categories = await CategoryModel.find({ userId }).sort({ name: 1 });
        
        res.status(200).json({
            message: 'Categories retrieved successfully',
            success: true,
            data: categories
        });
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ message: 'Failed to get categories', success: false });
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;
        
        const { id } = req.params;
        const { name, color, icon } = req.body;
        
        const category = await CategoryModel.findOne({ _id: id, userId });
        if (!category) {
            return res.status(404).json({ message: 'Category not found', success: false });
        }
        
        // Check if new name conflicts with existing category
        if (name && name !== category.name) {
            const existingCategory = await CategoryModel.findOne({ name, userId });
            if (existingCategory) {
                return res.status(400).json({ message: 'Category name already exists', success: false });
            }
        }
        
        const updateData = {};
        if (name) updateData.name = name;
        if (color) updateData.color = color;
        if (icon) updateData.icon = icon;
        
        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true }
        );
        
        res.status(200).json({
            message: 'Category updated successfully',
            success: true,
            data: updatedCategory
        });
    } catch (err) {
        console.error('Update category error:', err);
        res.status(500).json({ message: 'Failed to update category', success: false });
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;
        
        const { id } = req.params;
        
        const category = await CategoryModel.findOne({ _id: id, userId });
        if (!category) {
            return res.status(404).json({ message: 'Category not found', success: false });
        }
        
        if (category.isDefault) {
            return res.status(400).json({ message: 'Cannot delete default category', success: false });
        }
        
        await CategoryModel.findByIdAndDelete(id);
        
        res.status(200).json({
            message: 'Category deleted successfully',
            success: true
        });
    } catch (err) {
        console.error('Delete category error:', err);
        res.status(500).json({ message: 'Failed to delete category', success: false });
    }
};

// Initialize default categories for new user
const initializeDefaultCategories = async (userId) => {
    try {
        const defaultCategories = [
            { name: 'Work', color: '#007bff', icon: 'briefcase', isDefault: true },
            { name: 'Personal', color: '#28a745', icon: 'user', isDefault: true },
            { name: 'Shopping', color: '#ffc107', icon: 'shopping-cart', isDefault: true },
            { name: 'Health', color: '#dc3545', icon: 'heart', isDefault: true }
        ];
        
        for (const categoryData of defaultCategories) {
            const category = new CategoryModel({
                ...categoryData,
                userId
            });
            await category.save();
        }
    } catch (err) {
        console.error('Initialize default categories error:', err);
    }
};

module.exports = {
    createCategory,
    getUserCategories,
    updateCategory,
    deleteCategory,
    initializeDefaultCategories
};