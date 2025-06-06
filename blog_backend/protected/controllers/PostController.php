<?php

use WebSocket\Client;

class PostController extends Controller
{

    /**
     * Disables CSRF validation for the entire controller.
     */
    public function init()
    {
        Yii::app()->detachEventHandler('onBeginRequest', array(Yii::app()->request, 'validateCsrfToken'));
    }

    public function filters()
    {
        return array(
            array(
                'application.components.CorsFilter',
            ),
        );
    }


    /**
     * Sends a JSON response and ends the application.
     *
     * @param array $data The data to be encoded as JSON.
     * @param int $status The HTTP status code.
     */
    protected function jsonResponse($data, $status = 200)
    {
        header('Content-Type: application/json');
        echo json_encode($data);
        Yii::app()->end($status);
    }

     /**
     * Handles preflight (OPTIONS) requests.
     */
    public function actionOptions()
    {
        // This will be handled by the CORS filter.
        Yii::app()->end();
    }

    public function actionDo()
    {
        echo 'testtt';
        $this->jsonResponse(array(
            'message' => 'Failed to submit the post.',
        ), 400);
    }

    /**
     * Creates a new post.
     */
    public function actionCreate()
    {
        $model = new Post;

        // Retrieve POST data
        $user_id = Yii::app()->request->getPost('user_id');
        $title = Yii::app()->request->getPost('title');
        $description = Yii::app()->request->getPost('description');
        $content = Yii::app()->request->getPost('content');
        $public = Yii::app()->request->getPost('visibility');
        $created_at = date('Y-m-d H:i:s');
        
        // Assign attributes to the model
        $model->user_id = $user_id;
        $model->title = $title;
        $model->description = $description;
        $model->content = $content;
        $model->public = $public;
        $model->created_at = $created_at;

        // Save post
        if ($model->save()) {
            // Return JSON response
            $this->jsonResponse(array(
                'message' => 'Post has been posted successfully.',
                'post' => $model->attributes,
            ));
        } else {
            // Return validation errors
            $this->jsonResponse(array(
                'message' => 'Failed to submit the post.',
                'errors' => $model->getErrors(),
            ), 400);
        }
    }

    /**
     * Updates an existing post.
     */
    public function actionUpdate()
    {
        $id = Yii::app()->request->getPost('id');
        
        // Find the existing post model by ID
        $model = Post::model()->findByPk($id);

        if ($model === null) {
            // Return error if post not found
            $this->jsonResponse(array(
                'message' => 'Post not found.',
            ), 404);
            return;
        }

        // Retrieve POST data for updating the post
        $title = Yii::app()->request->getPost('title');
        $description = Yii::app()->request->getPost('description');
        $content = Yii::app()->request->getPost('content');
        $public = Yii::app()->request->getPost('public');

        // Assign new attributes to the model
        $model->title = $title;
        $model->description = $description;
        $model->content = $content;
        $model->public = $public;

        // Save updated post
        if ($model->save()) {
            // Return JSON response
            $this->jsonResponse(array(
                'message' => 'Post has been updated successfully.',
                'post' => $model->attributes,
            ));
        } else {
            // Return validation errors
            $this->jsonResponse(array(
                'message' => 'Failed to update the post.',
                'errors' => $model->getErrors(),
            ), 400);
        }
    }

    /**
     * Deletes a particular post.
     */
    public function actionDelete()
    {
        $post_id = Yii::app()->request->getPost('post_id');

        if (empty($post_id)) {
            // Return error if post_id is missing
            $this->jsonResponse(array(
                'message' => 'Post ID is required.',
            ), 400);
            return;
        }
    
        // Find the existing post model by ID
        $model = Post::model()->findByPk($post_id);

        if ($model === null) {
            // Return error if post not found
            $this->jsonResponse(array(
                'message' => 'Post not found.',
            ), 404);
            return;
        }

        // Attempt to delete the post
        if ($model->delete()) {
            // Return success response
            $this->jsonResponse(array(
                'message' => 'Post has been deleted successfully.',
            ));
        } else {
            // Return error if unable to delete the post
            $this->jsonResponse(array(
                'message' => 'Failed to delete the post.',
            ), 500);
        }
    }

    /**
     * Views a particular post.
     */
    public function actionView()
    {
        $id = Yii::app()->request->getPost('id');

        // Find the existing post model by ID
        $model = Post::model()->findByPk($id);

        if ($model === null) {
            // Return error if post not found
            $this->jsonResponse(array(
                'message' => 'Post not found.',
            ), 404);
            return;
        }

        // Return the post data
        $this->jsonResponse(array(
            'post' => $model->attributes,
        ));
    }

    /**
     * Lists all posts with optional filters.
     */
    public function actionIndex()
    {
        // Retrieve filters from the request
        $filters = Yii::app()->request->getPost('filters', array());

        $criteria = new CDbCriteria();

        // Apply filters to the query
        if (!empty($filters)) {
            if (isset($filters['public'])) {
                $criteria->addCondition('public = :public');
                $criteria->params[':public'] = $filters['public'];
            }

            if (isset($filters['search'])) {
                $criteria->addSearchCondition('title', $filters['search']);
                $criteria->addSearchCondition('description', $filters['search'], true, 'OR');
            }

            if (isset($filters['author'])) {
                $criteria->addCondition('user_id = :author');
                $criteria->params[':author'] = $filters['author'];
            }

            if (isset($filters['startDate'])) {
                $criteria->addCondition('created_at >= :startDate');
                $criteria->params[':startDate'] = $filters['startDate'];
            }

            if (isset($filters['endDate'])) {
                $criteria->addCondition('created_at <= :endDate');
                $criteria->params[':endDate'] = $filters['endDate'];
            }
        }

        // Find posts with the applied criteria
        $data = Post::model()->findAll($criteria);

        if (empty($data)) {
            // Return error if no posts found
            $this->jsonResponse(array(
                'message' => 'Posts not available.',
            ), 404);
            return;
        }

        // Collect attributes of all posts
        $posts = array();
        foreach ($data as $post) {
            $posts[] = $post->attributes;
        }

        // Return the post data
        $this->jsonResponse(array(
            'posts' => $posts,
            'message' => 'Posts available.',
        ));
    }

  
     /**
     * Lists all public blog posts with optional filters.
     */
    public function actionPublicPostsIndex()
    {
        $filters = Yii::app()->request->getPost('filters', array());

        $public = isset($filters['public']) ? $filters['public'] : null;
        $search = isset($filters['search']) ? $filters['search'] : null;
        $author = isset($filters['author']) ? $filters['author'] : null;
        $startDate = isset($filters['startDate']) ? $filters['startDate'] : null;
        $endDate = isset($filters['endDate']) ? $filters['endDate'] : null;

        try {
            $posts = Post::getPublicPosts($public, $search, $author, $startDate, $endDate);

            if (!empty($posts)) {
                $this->jsonResponse(array('posts' => $posts, 'message' => 'Posts available.'));
            } else {
                $this->jsonResponse(array('posts' => [], 'message' => 'No posts found.'));
            }
        } catch (Exception $e) {
            $this->jsonResponse(array('error' => 'An error occurred while fetching posts.'), 500);
        }
    }


    /**
     * Lists all blog posts that have at least 1 comment and their authors have at least 2 blogs.
     */
    public function actionAutoUpdatePublicPosts()
    {

        try {
            // Create WebSocket client connection
            $client = new Client("ws://localhost:8081");

            // Fetch public posts with comments
            $posts = Post::getPublicPostsWithComments();

            // Prepare response data
            if (!empty($posts)) {
                $postData = array('posts' => $posts);
            } else {
                $postData = array('posts' => [], 'message' => 'Posts not available found.');
            }

            $client->send(json_encode($postData));

        } catch (Exception $e) {
            // Log the exception and prepare an error response
            echo "Error: " . $e->getMessage() . "<br />\n";
            Yii::log("WebSocket error: " . $e->getMessage(), 'error');

            $this->jsonResponse([
                'posts' => [],
                'message' => 'An error occurred while fetching posts.',
            ]);
        } finally {
            // Ensure the WebSocket connection is closed
            if (isset($client)) {
                $client->close();
            }
        }
    }


    /**
     * Lists all blog posts that have at least 1 comment and their authors have at least 2 blogs.
     */
    public function actionGetAutoUpdatePublicPosts()
    {
        try {
            $posts = Post::getPublicPostsWithComments();

            if (!empty($posts)) {
                $this->jsonResponse(array('posts' => $posts));
            } else {
                $this->jsonResponse(array('posts' => [], 'message' => 'No posts found.'));
            }
        } catch (Exception $e) {
            $this->jsonResponse(array('error' => 'An error occurred while fetching posts.'), 500);
        }
    }


}
?>
