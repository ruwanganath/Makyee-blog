import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import qs from 'qs';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateBack } from '@fortawesome/free-solid-svg-icons';

const Register: React.FC = () => {
    // State variables for form inputs, messages, loading state, email validation, and verification details
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailValid, setEmailValid] = useState<boolean | null>(null);
    const [verificationLink, setVerificationLink] = useState(false);
    const [verificationToken, setVerificationToken] = useState('');

    // Validate email by sending a request to the backend
    const validateEmail = async (email: string) => {
        try {
            const response = await axios.post(
                'http://dev.blog_backend.com/index.php/user/ValidateEmail',
                qs.stringify({ email }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            setEmailValid(response.data.status); // Update email validation status
        } catch (error) {
            console.error(error);
            setEmailValid(false); // Set email validation to false on error
        }
    };

    // Handle changes to the email input
    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const emailValue = e.target.value;
        setEmail(emailValue);
        validateEmail(emailValue); // Validate email on change
    };

    // Handle form submission for registration
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (password !== passwordConfirm) {
            setMessage('Passwords do not match.');
            return;
        }
        if (emailValid === false) {
            setMessage('Email is already in use.');
            return;
        }
        setIsLoading(true);
        setMessage('');

        try {
            // Make POST request to register user
            const registerResponse = await axios.post(
                'http://dev.blog_backend.com/index.php/user/register',
                qs.stringify({ username, email, password }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            if (registerResponse.data.success) {
                // If registration is successful, show message and reset form
                setMessage(registerResponse.data.message);
                setVerificationToken(registerResponse.data.verificationToken);
                setUsername('');
                setEmail('');
                setPassword('');
                setPasswordConfirm('');
                setEmailValid(null);
                setVerificationLink(true);
            } else {
                setMessage(registerResponse.data.message || 'Registration failed, please try again.');
            }
        } catch (error) {
            setMessage('Registration failed, please try again.');
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
                <h2>Register</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                />
                {emailValid === false && <p>Email is already in use.</p>}
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                </button>
                <Link className="back" to="/">
                    <FontAwesomeIcon icon={faArrowRotateBack} /> Back
                </Link>
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

export default Register;
