import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate, Link, useNavigate } from 'react-router-dom';
import './assets/styles.css'; // Import global styles
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Post from './components/Post/Post';
import CreatePost from './components/Post/CreatePost';
import EditPost from './components/Post/EditPost';
import ViewPost from './components/Post/ViewPost';
import ManagePost from './components/Post/ManagePost';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faArrowRightFromBracket, faListCheck } from '@fortawesome/free-solid-svg-icons';

// A route that requires authentication to access
const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/" />;
};

// Layout for authentication-related pages (Login/Register)
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [type, setType] = useState<string>('signIn');
    const location = useLocation();

    useEffect(() => {
        // Update the type based on the current path
        setType(location.pathname === '/register' ? 'signUp' : 'signIn');
    }, [location.pathname]);

    const handleOnClick = (text: string) => {
        if (text !== type) {
            setType(text);
        }
    };

    const containerClass = `container ${type === 'signUp' ? 'right-panel-active' : ''}`;

    return (
        <div className={containerClass} id="container">
            {children}
            <div className="overlay-container">
                <div className="overlay">
                    <div className="overlay-panel overlay-left">
                        <h1>Welcome!</h1>
                        <p>To keep connected with us please login with your credentials</p>
                        <Link to="/">
                            <button className="ghost" id="signIn" onClick={() => handleOnClick('signIn')}>
                                Login
                            </button>
                        </Link>
                    </div>
                    <div className="overlay-panel overlay-right">
                        <h1>Hello, There!</h1>
                        <p>Enter your personal details and start your journey with us</p>
                        <Link to="/register">
                            <button className="ghost" id="signUp" onClick={() => handleOnClick('signUp')}>
                                Register
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main layout for authenticated users
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Handle user logout
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="main-layout">
            <div className="header">
                <h2>BLOG</h2>
            </div>
            <nav>
                <Link to="/" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faArrowRightFromBracket} /> Logout
                </Link>
                <Link to="/manage-posts">
                    <FontAwesomeIcon icon={faListCheck} /> Manage
                </Link>
                <Link to="/posts">
                    <FontAwesomeIcon icon={faHouse} /> Home
                </Link>
                {/* Add other navigation links here */}
            </nav>
            <div className="content">
                {children}
            </div>
            <div className="footer">
                <p>&copy; 2024 Ruwanganath Ramanayake. All rights reserved.</p>
            </div>
        </div>
    );
};

// Main application component with routing
const App: React.FC = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
           

            {/* Private Routes */}
            <Route path="/posts" element={<PrivateRoute><MainLayout><Post /></MainLayout></PrivateRoute>} />
            <Route path="/manage-posts" element={<PrivateRoute><MainLayout><ManagePost /></MainLayout></PrivateRoute>} />
            <Route path="/create" element={<PrivateRoute><MainLayout><CreatePost /></MainLayout></PrivateRoute>} />
            <Route path="/edit/:id" element={<PrivateRoute><MainLayout><EditPost /></MainLayout></PrivateRoute>} />
            <Route path="/view/:id" element={<PrivateRoute><MainLayout><ViewPost /></MainLayout></PrivateRoute>} />
            
        </Routes>
    );
};

// Wrap the app with AuthProvider and Router
const WrappedApp: React.FC = () => (
    <AuthProvider>
        <Router>
            <App />
        </Router>
    </AuthProvider>
);

export default WrappedApp;
