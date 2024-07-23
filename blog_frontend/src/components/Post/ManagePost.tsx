import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import qs from 'qs';
import { useAuth } from '../../contexts/AuthContext';
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';

// Define the structure of a Post object
interface Post {
    id: number;
    title: string;
    description: string;
    content: string;
    created_at: string;
    user_id: number;
    comment_count: number;
    like_count: number;
    public: number;
}

// Define the structure of filter options
interface Filters {
    search?: string;
    author?: string;
    startDate?: string;
    endDate?: string;
    user_id?: string | null;
}

const ManagePost: React.FC = () => {
    const { isAuthenticated } = useAuth(); // Retrieve authentication status
    const [posts, setPosts] = useState<(Post & { username: string })[]>([]); // State for storing posts with user data
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [error, setError] = useState<string | null>(null); // State for error messages
    const [message, setMessage] = useState(''); // State for success messages
    const [userId, setUserId] = useState<string | null>(null); // State for user ID from localStorage
    const [username, setUsername] = useState<string | null>(null); // State for username from localStorage
    const navigate = useNavigate(); // Hook for navigation

    // Function to fetch posts with optional filters
    const fetchPosts = useCallback(async (filters: Filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const userId = localStorage.getItem('userId'); // Retrieve user ID from localStorage
            const filtersWithUser = { ...filters, author: userId }; // Add user ID to filters
            const indexResponse = await axios.post(
                'http://dev.blog_backend.com/index.php/post/index',
                qs.stringify({ filters: filtersWithUser }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            if (Array.isArray(indexResponse.data.posts)) {
                // Fetch additional details for each post
                const postsWithUsernames = await Promise.all(indexResponse.data.posts.map(async (post: { id: number; user_id: number; }) => {
                    try {
                        const userResponse = await getUser(post.user_id);
                        const commentResponse = await getCommentCount(post.id);
                        const likeResponse = await getLikeCount(post.id);

                        return {
                            ...post,
                            username: userResponse.data.username,
                            comment_count: commentResponse.data.count,
                            like_count: likeResponse.data.count,
                        };
                    } catch (userError) {
                        console.error(`Failed to fetch username for user_id: ${post.user_id}`, userError);
                        return {
                            ...post,
                            username: 'Unknown',
                            comment_count: 0,
                            like_count: 0,
                        };
                    }
                }));
                setPosts(postsWithUsernames);
            } else if (indexResponse.data.message) {
                setMessage(indexResponse.data.message);
            } else {
                setError('Failed to fetch posts.');
            }
        } catch (error) {
            setError('Error fetching posts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/'); // Redirect to home if not authenticated
        } else {
            // Retrieve user information from localStorage
            const storedUserId = localStorage.getItem('userId');
            const storedUsername = localStorage.getItem('username');
            setUserId(storedUserId);
            setUsername(storedUsername);
            fetchPosts(); // Fetch posts when component mounts or authentication status changes
        }
    }, [isAuthenticated, navigate, fetchPosts]);

    // Fetch user details
    const getUser = async (user_id: number) => {
        return await axios.post(
            'http://dev.blog_backend.com/index.php/user/getUser',
            qs.stringify({ user_id: user_id }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    };

    // Fetch the comment count for a post
    const getCommentCount = async (postId: number) => {
        return await axios.post(
            'http://dev.blog_backend.com/index.php/comment/count',
            qs.stringify({ post_id: postId }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    };

    // Fetch the like count for a post
    const getLikeCount = async (postId: number) => {
        return await axios.post(
            'http://dev.blog_backend.com/index.php/like/count',
            qs.stringify({ post_id: postId }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    };

    // Handle deletion of a post
    const handleDelete = async (postId: number) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.post(
                    `http://dev.blog_backend.com/index.php/post/delete`,
                    qs.stringify({ post_id: postId }),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                );
                setMessage(response.data.message);
                fetchPosts(); // Refresh the posts list after deletion
            } catch (error) {
                setError('Error deleting post');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div>
            {loading && <p>Loading...</p>}
            <div className='row'>
                <div className="leftcolumn">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div className="card" key={post.id}>
                                <h2 className='title'>{post.title}</h2>
                                <p>{post.description}</p>
                                <div className='post-details'>
                                    <h5>Posted on: {post.created_at} | Posted by: {post.username}</h5>
                                    <h5>Comments: {post.comment_count} Likes: {post.like_count} {post.public === 1 ? <span style={{ color: 'green' }}>Public</span> : <span style={{ color: 'red' }}>Private</span>}</h5>
                                </div>
                                <div className='button-row'>
                                    <Link
                                        to={`/edit/${post.id}`}
                                        state={{ post }}
                                        className='action-like'
                                    >
                                        <FontAwesomeIcon icon={faPenToSquare} /> Edit
                                    </Link>
                                    <Link to='#' onClick={() => handleDelete(post.id)} className='action-like'>
                                        <FontAwesomeIcon icon={faTrashCan} /> Delete
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>
                            {error && <p>{error}</p>}
                            {message && <p>{message}</p>}
                        </div>
                    )}
                </div>
                <div className="rightcolumn">
                    <div className="card">
                        {userId ? (
                            <h2>Welcome, {username}</h2>
                        ) : (
                            <h2>No Username found. Please log in again.</h2>
                        )}
                    </div>
                    <div className="card">
                        <p>Writing a blog post is a great way to share your unique perspective and connect with like-minded individuals. Embrace the chance to express 
                            your ideas and let your creativity shine—your voice could be the inspiration someone needs! Click the "New Post" button to get started.</p>
                        <div className='button-row'>
                            <Link to="/create" className='action-like'>
                                <FontAwesomeIcon icon={faPlus}/> New Post
                            </Link>
                        </div>                       
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagePost;
