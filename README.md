# Task Manager

A full-stack Task Manager application built with React (frontend) and Node.js/Express/MongoDB (backend). Users can sign up, log in, and manage their tasks with a simple and intuitive interface.

## Features

- User authentication (signup & login)
- JWT-based session management
- Create, read, update, and delete (CRUD) tasks
- Responsive UI with Bootstrap
- Toast notifications for feedback
- Protected routes for authenticated users


##DEMO

### Login Page

![image](https://github.com/user-attachments/assets/be51a2a8-6553-48bb-b650-014290b161e0)


### Signup Page

![image](https://github.com/user-attachments/assets/5974b874-9882-46d1-8550-427eb9406a61)


### Task Dashboard

![image](https://github.com/user-attachments/assets/1b1568b5-46f5-467b-9df0-e605e3586d84)

---

## Project Structure
. ├── backend/ 
│ ├── Controllers/
│ ├── Middlewares/ 
│ ├── Models/ 
│ ├── Routes/ 
│ ├── .env 
│ ├── index.js 
│ ├── login.js 
│ └── package.json 
└── frontend/ 
   ├── public/
   ├── src/ 
   └── package.json

## Getting Started

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

1. Open a new terminal and navigate to the `frontend` directory:
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

## API Endpoints

### Auth

- `POST /auth/signup` — Register a new user
- `POST /auth/login` — Login and receive JWT

### Tasks

- `GET /tasks` — Get all tasks
- `POST /tasks` — Create a new task
- `PUT /tasks/:id` — Update a task by ID
- `DELETE /tasks/:id` — Delete a task by ID



## License

This project is licensed under the MIT License.

---

**Author:** Prajwal
