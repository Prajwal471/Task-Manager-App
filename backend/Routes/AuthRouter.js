const { signup, login, getUserProfile, updateUserProfile, changePassword } = require('../Controllers/AuthController');
const { signupValidation, loginValidation } = require('../Middlewares/AuthValidation');
const ensureAuthenticated = require('../Middlewares/Auth');

const router = require('express').Router();

router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);

// Protected routes
router.get('/profile', ensureAuthenticated, getUserProfile);
router.put('/profile', ensureAuthenticated, updateUserProfile);
router.post('/change-password', ensureAuthenticated, changePassword);

module.exports = router;