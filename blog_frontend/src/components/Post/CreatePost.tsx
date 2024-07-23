import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import qs from 'qs';
import { useAuth } from '../../contexts/AuthContext';

const CreatePost: React.FC = () => {
    // State variables for form inputs, loading state, error messages, and user information
    const { isAuthenticated } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const navigate = useNavigate();

    // Check if the user is authenticated and set user information from localStorage
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        } else {
            const storedUserId = localStorage.getItem('userId');
            const storedUsername = localStorage.getItem('username');
            setUserId(storedUserId);
            setUsername(storedUsername);
        }
    }, [isAuthenticated, navigate]);

    // Handle form submission for creating a post
    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Set visibility to 1 for public and 0 for private
            const visibilityValue = visibility === 'public' ? 1 : 0;

            const createResponse = await axios.post(
                'http://dev.blog_backend.com/index.php/post/create',
                qs.stringify({ user_id: userId, title, description, content, visibility: visibilityValue }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            // Reset form fields and set success message
            setTitle('');
            setDescription('');
            setContent('');
            setVisibility('public');
            setMessage(createResponse.data.message);
        } catch (error) {
            setError('Error creating post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {loading && <p>Loading...</p>}
            <div className='row'>
                {error && <p>{error}</p>}
                <div className="leftcolumn">
                    <form onSubmit={handleCreate}>
                        <input 
                            type="text" 
                            placeholder="Title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
                        />
                        <textarea 
                            className='description'
                            placeholder="Description" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            required 
                        ></textarea>
                        <textarea 
                            className='blogcontent'
                            placeholder="Content" 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)} 
                            required 
                        ></textarea>
                        <select
                            className='visibility'
                            value={visibility} 
                            onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                        <button className='create' type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Post'}
                        </button>
                        {message && <p>{message}</p>}
                    </form>
                </div>
                <div className="rightcolumn">
                    <div className="card">
                        {userId ? (
                            <h2>Welcome, {username}</h2>
                        ) : (
                            <h2>No Username found. Please log in again.</h2>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
