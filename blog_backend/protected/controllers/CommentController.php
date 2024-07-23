<?php

class CommentController extends Controller
{
    /**
     * Disables CSRF validation for the entire controller.
     */
    public function init()
    {
        Yii::app()->detachEventHandler('onBeginRequest', array(Yii::app()->request, 'validateCsrfToken'));
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
     * Displays comments for a particular post.
     *
     * @param integer $post_id The ID of the post for which comments are displayed.
     */
    public function actionView()
    {
        $post_id = Yii::app()->request->getPost('post_id');

        if (empty($post_id)) {
            // Return error if post_id is missing
            $this->jsonResponse(array(
                'message' => 'Post ID is required.',
            ), 400);
            return;
        }

        // Find all comments by post_id
        $comments = Comment::model()->findAllByAttributes(array('post_id' => $post_id));

        if (empty($comments)) {
            // Return error if comments not found
            $this->jsonResponse(array(
                'message' => 'No comments found for this post.',
                'comments' => null,
            ), 404);
            return;
        }

        // Extract attributes of all comments
        $commentsData = array();
        foreach ($comments as $comment) {
            $commentsData[] = $comment->attributes;
        }

        // Return the comments data
        $this->jsonResponse(array(
            'comments' => $commentsData,
        ));
    }

    /**
     * Creates a new comment.
     */
    public function actionCreate()
    {
        $model = new Comment;

        // Retrieve POST data
        $user_id = Yii::app()->request->getPost('user_id');
        $post_id = Yii::app()->request->getPost('post_id');
        $comment = Yii::app()->request->getPost('comment');
        $created_at = date('Y-m-d H:i:s');

        // Assign attributes to the model
        $model->user_id = $user_id;
        $model->post_id = $post_id;
        $model->comment = $comment;
        $model->created_at = $created_at;

        // Save comment
        if ($model->save()) {
            // Return success response
            $this->jsonResponse(array(
                'message' => 'Comment successful.',
                'comment' => $model->attributes,
            ));
        } else {
            // Return validation errors
            $this->jsonResponse(array(
                'message' => 'Failed to comment.',
                'errors' => $model->getErrors(),
            ), 400);
        }
    }

    /**
     * Deletes a comment.
     */
    public function actionDelete()
    {
        $comment_id = Yii::app()->request->getPost('id');

        if (empty($comment_id)) {
            // Return error if comment_id is missing
            $this->jsonResponse(array(
                'message' => 'Comment ID is required.',
            ), 400);
            return;
        }

        // Find the existing comment model by comment_id
        $model = Comment::model()->findByPk($comment_id);

        if ($model === null) {
            // Return error if comment not found
            $this->jsonResponse(array(
                'message' => 'Comment not found.',
            ), 404);
            return;
        }

        // Delete the comment
        if ($model->delete()) {
            $this->jsonResponse(array(
                'message' => 'Comment deleted successfully.',
            ));
        } else {
            $this->jsonResponse(array(
                'message' => 'Failed to delete the comment.',
            ), 500);
        }
    }

    /**
     * Counts the number of comments for a particular post.
     */
    public function actionCount()
    {
        $post_id = Yii::app()->request->getPost('post_id');

        if (empty($post_id)) {
            // Return error if post_id is missing
            $this->jsonResponse(array(
                'message' => 'Post ID is required.',
            ), 400);
            return;
        }

        // Find all comments by post_id
        $comments = Comment::model()->findAllByAttributes(array('post_id' => $post_id));

        // Set the count of comments
        $count = count($comments);

        // Return the comments count data
        $this->jsonResponse(array(
            'count' => $count,
        ));
    }

    /**
     * Updates an existing comment.
     */
    public function actionUpdate()
    {
        $id = Yii::app()->request->getPost('id');

        if (empty($id)) {
            // Return error if comment ID is missing
            $this->jsonResponse(array(
                'message' => 'Comment ID is required.',
            ), 400);
            return;
        }

        // Find the existing comment model by ID
        $model = Comment::model()->findByPk($id);

        if ($model === null) {
            // Return error if comment not found
            $this->jsonResponse(array(
                'message' => 'Comment not found.',
            ), 404);
            return;
        }

        // Retrieve POST data for updating the comment
        $comment = Yii::app()->request->getPost('comment');

        // Assign new attributes to the model
        $model->comment = $comment;

        // Save updated comment
        if ($model->save()) {
            // Return success response
            $this->jsonResponse(array(
                'message' => 'Comment has been updated successfully.',
            ));
        } else {
            // Return validation errors
            $this->jsonResponse(array(
                'message' => 'Failed to update the comment.',
                'errors' => $model->getErrors(),
            ), 400);
        }
    }
}
