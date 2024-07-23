import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import qs from 'qs';
import { useAuth } from '../../contexts/AuthContext';

const EditPost: React.FC = () => {
    const { isAuthenticated } = useAuth(); // Authentication status from context
    const [title, setTitle] = useState(''); // State for post title
    const [description, setDescription] = useState(''); // State for post description
    const [content, setContent] = useState(''); // State for post content
    const [visibility, setVisibility] = useState<'public' | 'private'>('public'); // State for post visibility
    const [createdAt, setCreatedAt] = useState(''); // State for post creation date
    const [loading, setLoading] = useState(false); // Loading state for form submission
    const [error, setError] = useState<string | null>(null); // Error message state
    const [message, setMessage] = useState(''); // Success message state
    const [userId, setUserId] = useState<string | null>(null); // User ID from localStorage
    const [username, setUsername] = useState<string | null>(null); // Username from localStorage

    const navigate = useNavigate(); // Hook to programmatically navigate
    const location = useLocation(); // Hook to access location state

    // Fetch and set post details when component mounts or authentication status changes
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/'); // Redirect to home if not authenticated
        } else {
            // Retrieve user information from localStorage
            const storedUserId = localStorage.getItem('userId');
            const storedUsername = localStorage.getItem('username');
            setUserId(storedUserId);
            setUsername(storedUsername);

            // Retrieve post details from location state
            const post = location.state?.post;
            if (post) {
                setTitle(post.title);
                setDescription(post.description);
                setContent(post.content);
                setVisibility(post.public ? 'public' : 'private');
                setCreatedAt(post.created_at);
            }
        }
    }, [isAuthenticated, navigate, location.state]);

    // Handle form submission to update post
    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const updateResponse = await axios.post(
                'http://dev.blog_backend.com/index.php/post/update',
                qs.stringify({
                    id: location.state.post.id,
                    user_id: userId,
                    title,
                    description,
                    content,
                    public: visibility === 'public' ? 1 : 0,
                    created_at: createdAt,
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            // Set success message after successful update
            setMessage(updateResponse.data.message);
        } catch (error) {
            // Set error message if the update fails
            setError('Error updating post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {loading && <p>Loading...</p>}
            <div className='row'>
                <div className="leftcolumn">
                    {error && <p>{error}</p>}
                    <form onSubmit={handleUpdate}>
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
                            {loading ? 'Updating...' : 'Update Post'}
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

export default EditPost;
