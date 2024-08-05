import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import qs from 'qs';
import { useAuth } from '../../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faBookOpenReader, faHeart } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment-timezone';

interface Post {
    id: number;
    title: string;
    description: string;
    content: string;
    created_at: string;
    public: '0' | '1';
    user_id: number; // Assuming user_id is a number
    comment_count: number;
    like_count:number;
    user_like:boolean;
}

interface Filters {
    search?: string;
    author?: string;
    startDate?: string;
    endDate?: string;
}

const Post: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [posts, setPosts] = useState<(Post & { username: string })[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [author, setAuthor] = useState('');
    const [iconVisibility, setIconVisibility] = useState<{ [key: number]: boolean }>({});

    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const navigate = useNavigate();

    const timeZone = 'Asia/Dubai'; // Replace with your desired time zone


    const fetchPosts = useCallback(async (filters: Filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            // Ensure we always fetch public posts by default
            const filtersWithPublic = { ...filters, public: '1' };
            const indexResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/index.php/post/publicPostsIndex`,
                qs.stringify({ filters: filtersWithPublic }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
           
            if (Array.isArray(indexResponse.data.posts)) {
                const postsWithAdditionalData = await Promise.all(indexResponse.data.posts.map(async (post: { id: number; user_id: number; }) => {
                    try {
                        const userResponse = await getUser(post.user_id);
                        const commentResponse = await getCommentCount(post.id);
                        const likeResponse = await getlike_count(post.id);
                        const userLikeResponse = await getUserLike(post.id, Number(localStorage.getItem('userId')));
                        return {
                            ...post,
                            username: userResponse.data.username, // Assuming the API returns { username: 'some_username' }
                            comment_count: commentResponse.data.count,
                            like_count: likeResponse.data.count,
                            user_like: userLikeResponse.data.like

                        };
                    } catch (userError) {
                        console.error(`Failed to fetch username for user_id: ${post.user_id}`, userError);
                        return {
                            ...post,
                            username: 'Unknown', // Fallback in case of error
                            comment_count: '0',
                            like_count: '0',
                            user_like: false
                        };
                    }
                }));

                // Set the icon visibility based on user_like
                const visibility: { [key: number]: boolean } = {};
                postsWithAdditionalData.forEach(post => {
                    visibility[post.id] = post.user_like;
                });

                setIconVisibility(visibility);
                setPosts(postsWithAdditionalData);
                setMessage(indexResponse.data.message);
            } else {
                setMessage(indexResponse.data.message);
            }
        } catch (error) {
            setError('Error fetching posts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        } else {
            const storedUserId = localStorage.getItem('userId');
            const storedUsername = localStorage.getItem('username');
            setUserId(storedUserId);
            setUsername(storedUsername);
            fetchPosts();
        }
    }, [isAuthenticated, navigate, fetchPosts]);

    
    // Example implementation of actionGetUser
    const getUser = async (userId: number) => {
        return await axios.post(
            `${import.meta.env.VITE_API_URL}/index.php/user/getUser`,
            qs.stringify({ user_id: userId }), // Ensure userId is correctly sent in the request body
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    };

    const getCommentCount = async (postId: number) => {
        return await axios.post(
            `${import.meta.env.VITE_API_URL}/index.php/comment/count`,
            qs.stringify({ post_id: postId }), // Ensure userId is correctly sent in the request body
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    };

    const getlike_count = async (postId: number) => {
        return await axios.post(
            `${import.meta.env.VITE_API_URL}/index.php/like/count`,
            qs.stringify({ post_id: postId }), // Ensure userId is correctly sent in the request body
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    };

    const getUserLike = async (postId: number, userId: number) => {
        return await axios.post(
            `${import.meta.env.VITE_API_URL}/index.php/like/getUserLike`,
            qs.stringify({ post_id: postId, user_id: userId }), // Ensure userId is correctly sent in the request body
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    };

   
    const makeLike = async (postId: number, userId: number) => {
        return await axios.post(
            `${import.meta.env.VITE_API_URL}/index.php/like/create`,
            qs.stringify({ post_id: postId, user_id: userId }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    };

    const undoLike = async (postId: number, userId: number) => {
        return await axios.post(
            `${import.meta.env.VITE_API_URL}/index.php/like/delete`,
            qs.stringify({ post_id: postId, user_id: userId }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    };

    const getUserIdByUsername =  async (username: string) => {
        return await axios.post(
            `${import.meta.env.VITE_API_URL}/index.php/user/getUsername`,
            qs.stringify({ username: username }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    };


    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const filters: Filters = {};
        if (search) filters.search = search;
        if (author){
            const userByUsernameResponse = await getUserIdByUsername(author);
            if(userByUsernameResponse.data.status){
                filters.author = userByUsernameResponse.data.user_id;
            }
        } 
        if (startDate) {
            const startNewDate = moment.tz(startDate, timeZone).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            filters.startDate = startNewDate;
        }
        if (endDate) {
            const endNewDate = moment.tz(endDate, timeZone).endOf('day').format('YYYY-MM-DD HH:mm:ss');
            filters.endDate = endNewDate;
        }
        fetchPosts(filters);
    };

    const handleLikeClick = async (postId: number, userId: number) => {
        const currentVisibility = iconVisibility[postId]; // Default to false if undefined
        setIconVisibility(prevVisibility => ({
            ...prevVisibility,
            [postId]: !currentVisibility
        }));
    
        try {
            if (currentVisibility) {
                await undoLike(postId, userId);
                setPosts(prevPosts => prevPosts.map(post =>
                    post.id === postId ? { ...post, like_count: post.like_count - 1, user_like: false } : post
                ));
            } else {
                await makeLike(postId, userId);
                setPosts(prevPosts => prevPosts.map(post =>
                    post.id === postId ? { ...post, like_count: post.like_count + 1, user_like: true } : post
                ));
            }
        } catch (error) {
            console.error('Error updating like status', error);
        }
    };

    return (
        <div>           
            {loading && <p>Loading...</p>}
            <div className='row'>
                <div className="leftcolumn">
                {posts.length !== 0 ? (
                    posts.map((post) => (
                        <div className="card" key={post.id}>
                            <h2 className='title'>{post.title}</h2>
                            <p>{post.description}</p>
                            <div className='post-details'>
                                <h5>Posted on :  {post.created_at}  |   Posted by :  {post.username}</h5>
                                <h5>Comments : {post.comment_count}   Likes : {post.like_count}</h5>
                            </div>
                            <div className='button-row'>
                                {iconVisibility[post.id] && <div className='liked'><FontAwesomeIcon icon={faHeart} /></div>}
                                <Link to={'#'} onClick={() => handleLikeClick(post.id, Number(userId))} className='action-like'>
                                    <FontAwesomeIcon icon={faThumbsUp} /> {iconVisibility[post.id] ? 'Unlike' : 'Like'}
                                </Link>
                                <Link
                                    to={`/view/${post.id}`}
                                    state={{ id: post.id }}
                                    className='action-like'
                                >
                                    <FontAwesomeIcon icon={faBookOpenReader} /> Read
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <><p>{error && <p>{error}</p>} </p><p>{message && <p>{message}</p>}</p></>
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
                        <h3>Search Posts..</h3>
                        <form className="search" onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Title or Description"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <h3>Filter By..</h3>
                            <input
                                type="text"
                                placeholder="Author"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                            />
                            <label>Start Date:</label>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                isClearable
                                placeholderText="Select a start date"
                                dateFormat="YYYY-MM-dd"
                            />
                            <label>End Date:</label>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                isClearable
                                placeholderText="Select an end date"
                                dateFormat="YYYY-MM-dd"
                            />
                            <button type='submit'>Search</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Post;
