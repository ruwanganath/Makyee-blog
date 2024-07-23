import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import qs from 'qs';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
    // State variables for username, password, message, loading state, verification link, and token
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [verificationLink, setVerificationLink] = useState(false);
    const [verificationToken, setVerificationToken] = useState('');

    // React Router's navigate hook for programmatic navigation
    const navigate = useNavigate();

    // Auth context for login function
    const { login } = useAuth();

    // Handle form submission for login
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            // Make POST request to authenticate user
            const response = await axios.post(
                'http://dev.blog_backend.com/index.php/user/authenticate',
                qs.stringify({ username, password }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            const { success, message, userId, verification_token, verificationLink } = response.data;

            if (success) {
                // If login is successful, store userId and username in local storage
                setMessage(message);
                localStorage.setItem('userId', userId);
                localStorage.setItem('username', username);
                login(userId, success); // Call login function from auth context
                navigate('/posts'); // Navigate to the posts page
            } else {
                // If login fails, set message and handle verification if needed
                setMessage(message);
                setVerificationToken(verification_token);
                setVerificationLink(verificationLink);
            }
        } catch (error) {
            // Handle errors during the request
            if (axios.isAxiosError(error) && error.response) {
                setMessage(error.response.data.message || 'Login failed, please try again.');
            } else {
                setMessage('An error occurred, please try again.');
            }
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    // Handle click on verification link
    const handleVerifyClick = async () => {
        try {
            const verifyTokenResponse = await axios.post(
                'http://dev.blog_backend.com/index.php/user/VerifyToken',
                qs.stringify({ verification_token: verificationToken }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            if (verifyTokenResponse.data.success) {
                setMessage(verifyTokenResponse.data.message);
                setVerificationLink(false); // Hide verification link after successful verification
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="form-container sign-in-container ghost">
            <form onSubmit={handleSubmit}>
                <h2>Login</h2>
                <span>Please login with your credentials</span>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
                {message && <p>{message}</p>}
                {verificationLink && (
                    <a className="verify" rel="noopener noreferrer" onClick={handleVerifyClick}>
                        Click here to Verify your account.
                    </a>
                )}                
            </form>   
        </div>
    );
};

export default Login;
