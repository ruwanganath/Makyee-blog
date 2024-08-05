import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import qs from 'qs';
import "react-datepicker/dist/react-datepicker.css";

// Interface defining the structure of a Post object
interface Post {
    id: number;
    title: string;
    description: string;
    content: string;
    created_at: string;
    public: '0' | '1'; // '0' for private, '1' for public
    user_id: number;
    comment_count: number;
    like_count: number;
    user_like: boolean; // Indicates if the current user liked the post
}

const PublicPosts: React.FC = () => {
    // State variables for managing posts, loading state, errors, and WebSocket connection
    const [posts, setPosts] = useState<(Post & { username: string })[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const ws = useRef<WebSocket | null>(null); // WebSocket reference for real-time updates

    /**
     * Fetch and enrich posts with additional data.
     * This includes fetching the username, comment count, like count, and if the user liked the post.
     */
    const fetchPosts = useCallback(async (fetchedPosts: Post[]) => {
        setLoading(true); // Set loading state
        setError(null); // Reset error state
        try {
            // Enrich each post with additional data
            const postsWithAdditionalData = await Promise.all(
                fetchedPosts.map(async (post: Post) => {
                    try {
                        const userResponse = await getUser(post.user_id);
                        const commentResponse = await getCommentCount(post.id);
                        const likeResponse = await getLikeCount(post.id);
                        const userLikeResponse = await getUserLike(post.id, Number(localStorage.getItem('userId')));

                        return {
                            ...post,
                            username: userResponse.data.username,
                            comment_count: commentResponse.data.count,
                            like_count: likeResponse.data.count,
                            user_like: userLikeResponse.data.like
                        };
                    } catch (error) {
                        console.error(`Failed to fetch data for post_id: ${post.id}`, error);
                        return {
                            ...post,
                            username: 'Unknown', // Default username in case of error
                            comment_count: 0,
                            like_count: 0,
                            user_like: false
                        };
                    }
                })
            );
            setPosts(postsWithAdditionalData); // Update posts state
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError('Error fetching posts'); // Set error state
        } finally {
            setLoading(false); // Reset loading state
        }
    }, []);

    // useEffect hook to fetch initial posts and setup WebSocket connection
    useEffect(() => {
        // Fetch initial post data
        const getInitialPostData = async () => {
            setLoading(true);
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/index.php/post/getAutoUpdatePublicPosts`,
                    {}, // Empty object as data payload
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                );
                fetchPosts(response.data.posts); // Fetch posts with additional data
            } catch (error) {
                console.error('Error fetching initial posts:', error);
                setError('Error fetching initial posts'); // Set error state
            } finally {
                setLoading(false); // Reset loading state
            }
        };

        // Setup WebSocket connection for real-time updates
        const connectWebSocket = () => {
            ws.current = new WebSocket(import.meta.env.VITE_WEBSOCKET_SERVER_URL);

            ws.current.onopen = () => {
                console.log('Connected to WebSocket server');
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.posts) {
                    fetchPosts(data.posts); // Update posts when new data is received
                }
                if (data.message) {
                    setMessage(data.message); // Update message state
                }
            };

            ws.current.onclose = () => {
                console.log('Disconnected from WebSocket server');
                ws.current = null;
                setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                if (ws.current) {
                    ws.current.close(); // Close WebSocket on error
                }
            };
        };

        getInitialPostData(); // Initial data fetch
        connectWebSocket(); // Initialize WebSocket connection

    }, [fetchPosts]);

    // API call to fetch user data based on user ID
    const getUser = async (userId: number) => {
        return await axios.post(
            `${import.meta.env.VITE_API_URL}/index.php/user/getUser`,
            qs.stringify({ user_id: userId }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    };

    // API call to fetch comment count for a post based on post ID
    const getCommentCount = async (postId: number) => {
        return await axios.post(
            `${import.meta.env.VITE_API_URL}/index.php/comment/count`,
            qs.stringify({ post_id: postId }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    };

    // API call to fetch like count for a post based on post ID
    const getLikeCount = async (postId: number) => {
        return await axios.post(
            `${import.meta.env.VITE_API_URL}/index.php/like/count`,
            qs.stringify({ post_id: postId }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    };

    // API call to check if the current user liked a post
    const getUserLike = async (postId: number, userId: number) => {
        return await axios.post(
            `${import.meta.env.VITE_API_URL}/index.php/like/getUserLike`,
            qs.stringify({ post_id: postId, user_id: userId }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    };

    return (
        <div>
            {loading && <p>Loading...</p>} {/* Display loading message if data is being fetched */}
            <div className='row'>
                <div className="leftcolumn">
                    {posts.length !== 0 ? (
                        posts.map((post) => (
                            <div className="card" key={post.id}>
                                <h2 className='title'>{post.title}</h2>
                                <p>{post.description}</p>
                                <div className='post-details'>
                                    <h5>Posted on: {post.created_at} | Posted by: {post.username}</h5>
                                    <h5>Comments: {post.comment_count} | Likes: {post.like_count}</h5>
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            {error && <p>{error}</p>} {/* Display error message if an error occurred */}
                            {message && <p>{message}</p>} {/* Display server message if available */}
                        </>
                    )}
                </div>
                <div className="rightcolumn">
                    <div className="card">
                        <h2>Welcome to the Blog..</h2> {/* Welcome message */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicPosts;
