import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import TaskManager from './TaskManager';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
// import Home from './Pages/Home'
import { useState } from 'react';
import RefrshHandler from './RefreshHandler';
// import PrivateRoute from './PrivateRoute'; // Uncomment if you have this

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
   const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" replace />
   }
   
  return (
    <div className="App">
      <RefrshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path='/' element={<Navigate to="/login" replace />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/taskmanager' element={<PrivateRoute element={<TaskManager />} />} />
      </Routes>
      
    </div>
  );
}

export default App;