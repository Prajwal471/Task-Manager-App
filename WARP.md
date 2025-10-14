# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TaskFlow is a full-stack task management application with JWT authentication, real-time notifications, and advanced features like analytics, categories, and task export. Built with React frontend and Node.js/Express/MongoDB backend.

## Development Commands

### Backend Development
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server with nodemon
npm start

# The backend runs on PORT=8080 by default
```

### Frontend Development
```bash
# Navigate to frontend directory  
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Visit http://localhost:3000 in browser
# Frontend connects to http://localhost:8080 backend API
```

### Running Both Services
From project root, open two terminals:
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
cd frontend && npm start
```

### Testing
```bash
# Frontend tests
cd frontend
npm test

# Backend currently has no test setup - tests would use npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build

# Backend uses production environment variables from .env file
```

## Architecture Overview

### Backend Architecture (Node.js/Express)
- **Entry Point**: `backend/index.js` - Main server setup with middleware and routes
- **Database**: MongoDB connection via `backend/Models/db.js`
- **Authentication**: JWT-based auth in `backend/Controllers/AuthController.js`
- **MVC Pattern**:
  - **Models**: User, Task, Category models with Mongoose schemas
  - **Controllers**: Business logic for Auth, Task, Category operations
  - **Routes**: API endpoints mapping to controllers
  - **Middlewares**: Auth validation and request processing

### Key Backend Features
- **Automatic Notifications**: `backend/dueDateNotifier.js` runs background scheduler
- **User Statistics**: Tracked in User model with stats subdocument
- **Advanced Task Queries**: Filtering, sorting, pagination, search in TaskController
- **Push Notifications**: Web push notifications via `backend/utils/notification.js`

### Frontend Architecture (React)
- **Main Component**: `frontend/src/TaskManager.js` - Primary UI with state management
- **API Layer**: `frontend/src/api.js` - Centralized HTTP requests to backend
- **Authentication**: JWT token stored in localStorage with `RefreshHandler.js`
- **UI Features**: 
  - Bootstrap-based responsive design
  - List/Grid view modes
  - Real-time toast notifications
  - Dark/Light theme support
  - Export functionality (PDF/CSV/JSON)

### Database Schema
- **Users**: Authentication, preferences, push subscriptions, usage stats
- **Tasks**: Full task management with subtasks, attachments, categories, priority levels
- **Categories**: User-defined task categorization with colors and icons

### Authentication Flow
1. Users sign up/login via `/auth/signup` and `/auth/login`
2. JWT tokens stored in localStorage with automatic refresh
3. All API requests include Authorization header
4. Protected routes verified server-side via JWT middleware

## Environment Setup

### Backend Environment Variables (.env)
```
PORT=8080
DB_URL=your_mongodb_connection_string  
JWT_SECRET=your_jwt_secret
VAPID_PUBLIC_KEY=your_vapid_public_key (optional)
VAPID_PRIVATE_KEY=your_vapid_private_key (optional)
```

### Key Configuration
- Backend API URL is hardcoded in `frontend/src/utils.js` as `http://localhost:8080`
- MongoDB connection required for backend to start
- Frontend expects backend running on port 8080

## Development Patterns

### API Request Pattern
All API calls use centralized functions in `frontend/src/api.js`:
```javascript
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': localStorage.getItem('token')
});
```

### Error Handling
- Backend: Try-catch blocks with standardized JSON error responses
- Frontend: Toast notifications for user feedback via react-toastify

### State Management  
- React useState and useEffect hooks
- No external state management (Redux/Context)
- Local state in TaskManager.js component with props passing

### Task Operations
- Create, Read, Update, Delete with optimistic UI updates
- Real-time filtering and sorting without backend round-trips for UI responsiveness
- Background due date notification system

## Common Development Patterns

### Adding New API Endpoints
1. Add route in `backend/Routes/[Entity]Router.js`
2. Implement controller function in `backend/Controllers/[Entity]Controller.js`
3. Add API function in `frontend/src/api.js`
4. Use API function in React components

### Database Models
- All models use Mongoose with timestamps
- User references via ObjectId with population for joins
- Task model supports rich features: subtasks, tags, attachments, recurring patterns

### Authentication Requirements
- All task/category endpoints require valid JWT
- User ID extracted from JWT token for data isolation
- No role-based permissions - user sees only their own data
