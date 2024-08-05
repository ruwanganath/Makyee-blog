import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import qs from 'qs';
import "react-datepicker/dist/react-datepicker.css";

interface Post {
    id: number;
    title: string;
    description: string;
    content: string;
    created_at: string;
    public: '0' | '1';
    user_id: number;
    comment_count: number;
    like_count: number;
    user_like: boolean;
}

const PublicPosts: React.FC = () => {
    const [posts, setPosts] = useState<(Post & { username: string })[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const ws = useRef<WebSocket | null>(null);

    // Fetch posts and enrich data
    const fetchPosts = useCallback(async (fetchedPosts: Post[]) => {
        setLoading(true);
        setError(null);
        try {
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
                            username: 'Unknown',
                            comment_count: 0,
                            like_count: 0,
                            user_like: false
                        };
                    }
                })
            );
            setPosts(postsWithAdditionalData);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError('Error fetching posts');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial post fetching and WebSocket setup
    useEffect(() => {
        // Initial fetch for posts
        const getInitialPostData = async () => {
            setLoading(true);
            try {
                const response = await axios.post(
                    'http://dev.blog_backend.com/index.php/post/getAutoUpdatePublicPosts',
                    {}, // Empty object as data payload
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                );
                fetchPosts(response.data.posts);
            } catch (error) {
                console.error('Error fetching initial posts:', error);
                setError('Error fetching initial posts');
            } finally {
                setLoading(false);
            }
        };

        // WebSocket connection setup
        const connectWebSocket = () => {
            ws.current = new WebSocket('ws://localhost:8081');

            ws.current.onopen = () => {
                console.log('Connected to WebSocket server');
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.posts) {
                    fetchPosts(data.posts);
                }
                if (data.message) {
                    setMessage(data.message);
                }
            };

            ws.current.onclose = () => {
                console.log('Disconnected from WebSocket server');
                ws.current = null;
                setTimeout(connectWebSocket, 3000); // Retry after 3 seconds
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                if (ws.current) {
                    ws.current.close();
                }
            };
        };

        getInitialPostData(); // Fetch initial posts
        connectWebSocket(); // Initialize the WebSocket connection

    }, [fetchPosts]);

    // API calls to fetch additional data
    const getUser = async (userId: number) => {
        return await axios.post(
            'http://dev.blog_backend.com/index.php/user/getUser',
            qs.stringify({ user_id: userId }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    };

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

    const getUserLike = async (postId: number, userId: number) => {
        return await axios.post(
            'http://dev.blog_backend.com/index.php/like/getUserLike',
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
            {loading && <p>Loading...</p>}
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
                            {error && <p>{error}</p>}
                            {message && <p>{message}</p>}
                        </>
                    )}
                </div>
                <div className="rightcolumn">
                    <div className="card">
                        <h2>Welcome to the Blog..</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicPosts;
