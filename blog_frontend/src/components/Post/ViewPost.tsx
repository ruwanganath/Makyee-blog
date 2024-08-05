import React, { useState, useEffect, FormEvent, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import qs from 'qs';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';

// Define the types for Post and Comment
interface Post {
    id: number;
    title: string;
    description: string;
    content: string;
    visibility: 'public' | 'private';
    created_at: string;
    user_id: number;
}

interface Comment {
    id: number;
    post_id: number;
    user_id: number;
    comment: string;
    created_at: string;
    username: string;
}

const ViewPost: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null); 
    const [username, setUsername] = useState<string | null>(null);
    const [postUsername, setPostUsername] = useState<string | null>(null);
    const [commentText, setCommentText] = useState<string>('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const ws = useRef<WebSocket | null>(null);

    const navigate = useNavigate();
  

    // Fetch user details by user_id
    const getUser = useCallback(async (user_id: number) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/index.php/user/getUser`,
                qs.stringify({ user_id }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch user details for user_id: ${user_id}`, error);
            throw error;
        }
    }, []);

    // Fetch comments for the post
    const fetchComments = useCallback(async () => {
        try {
            const commentsResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/index.php/comment/view`,
                qs.stringify({ post_id: id }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
            
            if (commentsResponse.data.comments) {
                const fetchedComments: Comment[] = commentsResponse.data.comments;
                const commentsWithUsernames = await Promise.all(
                    fetchedComments.map(async (comment) => {
                        try {
                            const userResponse = await getUser(comment.user_id);
                            return { ...comment, username: userResponse.username };
                        } catch (userError) {
                            console.error(`Failed to fetch username for user_id: ${comment.user_id}`, userError);
                            return { ...comment, username: 'Unknown' };
                        }
                    })
                );

                setComments(commentsWithUsernames);
            }
        } catch (error) {
            console.error('Failed to fetch comments', error);
            setError('Error fetching comments');
        }
    }, [id, getUser]);

    // Fetch the post and its associated data
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const viewResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/index.php/post/view`,
                qs.stringify({ id }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            const postData: Post = viewResponse.data.post;
            setPost(postData);

            // Fetch username for the post's user_id
            try {
                const userResponse = await getUser(postData.user_id);
                setPostUsername(userResponse.username);
            } catch (userError) {
                console.error(`Failed to fetch username for user_id: ${postData.user_id}`, userError);
                setPostUsername('Unknown');
            }

            // Fetch comments for the post
            fetchComments();
        } catch (error) {
            setError('Failed to fetch post details');
        } finally {
            setLoading(false);
        }
    }, [fetchComments, getUser, id]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        } else {
            const storedUserId = localStorage.getItem('userId');
            const storedUsername = localStorage.getItem('username');
            setUserId(storedUserId ? parseInt(storedUserId, 10) : null);
            setUsername(storedUsername);
            fetchPosts();
        }

        const connectWebSocket = () => {

            ws.current = new WebSocket(import.meta.env.VITE_WEBSOCKET_SERVER_URL);
      
            ws.current.onopen = () => {
              console.log('Connected to WebSocket server');
            };
      
            ws.current.onclose = () => {
              console.log('Disconnected from WebSocket server');
              ws.current = null;
              // Attempt to reconnect after a delay
              setTimeout(connectWebSocket, 2000); // Retry after 5 seconds
            };
      
            ws.current.onerror = (error) => {
              console.error('WebSocket error:', error);
            };
          };
      
          connectWebSocket(); // Initialize the connection

    }, [id, isAuthenticated, navigate, fetchPosts]);

    // Handle comment submission for both new and existing comments
    const handleCommentSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editingCommentId) {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/index.php/comment/update`,
                    qs.stringify({ id: editingCommentId, comment: commentText }),
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                );
                setMessage('Comment updated successfully.');
                setEditingCommentId(null);
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/index.php/comment/create`,
                    qs.stringify({ post_id: id, user_id: userId, comment: commentText }),
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                );
                setMessage('Comment added successfully.');
            }

            setCommentText('');
            fetchComments();
            updatePublicPosts();
        } catch (error) {
            setError('Error creating or updating comment');
        } finally {
            setLoading(false);
        }
    };

    // Prepare the form for editing an existing comment
    const handleEditComment = (comment: Comment) => {
        setCommentText(comment.comment);
        setEditingCommentId(comment.id);
    };

    // Handle comment deletion
    const handleDeleteComment = async (commentId: number) => {
        if (confirm("Are you sure you want to delete this comment?")) {
            setLoading(true);
            setError(null);

            try {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/index.php/comment/delete`,
                    qs.stringify({ id: commentId }),
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                );
                setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
                setMessage('Comment deleted successfully.');
                updatePublicPosts();
            } catch (error) {
                setError('Error deleting comment');
            } finally {
                setLoading(false);
            }
        }
    };

    const updatePublicPosts = async () => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            try {
                await axios.get(
                    `${import.meta.env.VITE_API_URL}/index.php/post/autoUpdatePublicPosts`,
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                );
            } catch (error) {
                setError('Error fetching public posts.');
            }
        } else {
          console.error('WebSocket is not open or has been closed');
        }
    };

    // Render the component
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!post) return <p>No post found</p>;

    return (
        <div>
            <div className='row'>
                <div className="leftcolumn">
                    <div className='card'>
                        <h1>{post.title}</h1>
                        <h4>Posted by: {postUsername} | Posted on: {post.created_at}</h4>
                        <h5 className='view-description'>{post.description}</h5>
                        <div>{post.content}</div>
                    </div>

                    <div className='comment-card'>
                        <h3>Comments</h3>
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <div key={comment.id}>
                                    <p>{comment.comment}</p>
                                    <h5>Commented on: {comment.created_at} By: {comment.username}</h5>
                                    {(userId === post.user_id || userId === comment.user_id) && (
                                        <div className='button-row'>
                                            <button
                                                onClick={() => handleEditComment(comment)}
                                                className='action-like'
                                            >
                                                <FontAwesomeIcon icon={faPenToSquare} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className='action-like'
                                            >
                                                <FontAwesomeIcon icon={faTrashCan} /> Delete
                                            </button>
                                        </div>
                                    )}
                                    <hr />
                                </div>
                            ))
                        ) : (
                            <p>No comments available</p>
                        )}
                    </div>
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
                        <h3>Leave a Comment</h3>
                        <form className='comment-form' onSubmit={handleCommentSubmit}>
                            <textarea
                                className='comment'
                                placeholder="Comment"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                required
                            ></textarea>
                            <button type='submit'>{editingCommentId ? 'Update' : 'Comment'}</button>
                        </form>
                        {message && <p>{message}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewPost;
