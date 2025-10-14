const express = require('express');
const app = express();
require('dotenv').config();
require('./Models/db');

// Start due date notifier
require('./dueDateNotifier');

const PORT = process.env.PORT || 8080;
const TaskRouter = require('./Routes/TaskRouter');
const CategoryRouter = require('./Routes/CategoryRouter');
const NotificationRouter = require('./Routes/NotificationRouter');
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');

// Apply middleware BEFORE routes
app.use(cors())
app.use(bodyParser.json());

app.get('/', (req, res) => {
     res.send('Hello from the server!')
})

app.get('/test-db', async (req, res) => {
    try {
        const UserModel = require('./Models/User');
        const count = await UserModel.countDocuments();
        res.json({ success: true, message: 'Database connected', userCount: count });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
})

app.post('/test-signup', async (req, res) => {
    try {
        const bcrypt = require('bcrypt');
        const UserModel = require('./Models/User');
        const { name, email, password } = req.body;
        
        console.log('Test signup attempt:', { name, email, passwordLength: password?.length });
        
        // Test bcrypt
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('Password hashed successfully');
        
        // Test user creation without stats
        const userModel = new UserModel({ 
            name, 
            email, 
            password: hashedPassword
        });
        
        await userModel.save();
        console.log('User saved successfully');
        
        res.json({ success: true, message: 'Test signup successful', userId: userModel._id });
    } catch (error) {
        console.error('Test signup error:', error);
        res.status(500).json({ success: false, message: 'Test signup failed', error: error.message });
    }
})




app.use('/tasks', TaskRouter)
app.use('/categories', CategoryRouter)
app.use('/auth', AuthRouter);
app.use('/notifications', NotificationRouter);

// Fallback direct route for public VAPID key to ensure availability
app.get('/notifications/public-key', (req, res) => {
    const key = process.env.VAPID_PUBLIC_KEY || null;
    res.status(200).json({ publicKey: key, configured: !!key });
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT = ${PORT}`);
})