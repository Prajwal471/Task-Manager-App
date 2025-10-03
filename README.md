# TaskFlow - Smart Task Management

A modern, full-stack task management application built with React (frontend) and Node.js/Express/MongoDB (backend). TaskFlow helps users organize, track, and complete their tasks efficiently with an intuitive and beautiful interface.

## ✨ Features

- **Smart Authentication** - Secure signup & login with JWT-based session management
- **Task Management** - Create, read, update, and delete (CRUD) tasks with ease
- **Modern UI/UX** - Responsive design with beautiful animations and dark/light themes
- **Real-time Notifications** - Toast notifications for instant feedback
- **Protected Routes** - Secure access to task management features
- **Enhanced UI** - Glass-morphism design with gradient backgrounds and smooth animations

## 🚀 Demo

### Login Page
![TaskFlow Login](https://github.com/user-attachments/assets/be51a2a8-6553-48bb-b650-014290b161e0)

### Signup Page
![TaskFlow Signup](https://github.com/user-attachments/assets/5974b874-9882-46d1-8550-427eb9406a61)

### Task Dashboard
![TaskFlow Dashboard](https://github.com/user-attachments/assets/1b1568b5-46f5-467b-9df0-e605e3586d84)

---

## 🏗️ Project Structure
```
TaskFlow/
├── backend/
│   ├── Controllers/
│   ├── Middlewares/
│   ├── Models/
│   ├── Routes/
│   ├── .env
│   ├── index.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    └── package.json
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. Navigate to the `backend` directory:
    ```sh
    cd backend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Configure environment variables in `.env`:
    ```
    PORT=8080
    DB_URL=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

4. Start the backend server:
    ```sh
    npm start
    ```

### Frontend Setup

1. Navigate to the `frontend` directory:
    ```sh
    cd frontend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Start the frontend development server:
    ```sh
    npm start
    ```

4. Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🔗 API Endpoints

### Authentication
- `POST /auth/signup` — Register a new user
- `POST /auth/login` — Login and receive JWT
- `GET /auth/profile` — Get user profile (protected)
- `PUT /auth/profile` — Update user profile (protected)

### Tasks
- `GET /tasks` — Get all tasks for authenticated user
- `POST /tasks` — Create a new task
- `PUT /tasks/:id` — Update a task
- `DELETE /tasks/:id` — Delete a task
- `GET /tasks/analytics` — Get task analytics

### Categories
- `GET /categories` — Get all categories for user
- `POST /categories` — Create a new category
- `PUT /categories/:id` — Update a category
- `DELETE /categories/:id` — Delete a category

## 🎨 Technology Stack

- **Frontend:** React, Bootstrap, Font Awesome
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Styling:** Custom CSS with animations and responsive design
- **API Communication:** Fetch API

## 🚀 Deployment

TaskFlow can be easily deployed to various platforms:

- **Frontend:** Vercel, Netlify, or GitHub Pages
- **Backend:** Vercel, Heroku, or Railway
- **Database:** MongoDB Atlas (cloud)

## 📱 Features Highlight

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Theme Support** - Dark and light mode with smooth transitions
- **Real-time Updates** - Instant feedback with toast notifications
- **Secure Authentication** - JWT-based with session management
- **Task Analytics** - Track your productivity and progress
- **Category Management** - Organize tasks with custom categories

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Built with ❤️ for better task management and productivity.

---

**TaskFlow** - *Where productivity meets simplicity*