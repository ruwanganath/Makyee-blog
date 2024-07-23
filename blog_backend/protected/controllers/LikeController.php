<?php

class LikeController extends Controller
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
     * Displays a particular like model based on post_id and user_id.
     */
    public function actionView()
    {
        $post_id = Yii::app()->request->getPost('post_id');
        $user_id = Yii::app()->request->getPost('user_id');

        if (empty($post_id) || empty($user_id)) {
            // Return error if post_id or user_id is missing
            $this->jsonResponse(array(
                'message' => 'Post ID and User ID are required.',
            ), 400);
            return;
        }

        // Find the existing like model by user_id and post_id
        $model = Like::model()->findByAttributes(array('post_id' => $post_id, 'user_id' => $user_id));

        if ($model === null) {
            // Return error if like not found
            $this->jsonResponse(array(
                'like' => null,
            ));
            return;
        }

        // Return the like data
        $this->jsonResponse(array(
            'like' => $model->attributes,
        ));
    }

    /**
     * Creates a new like model.
     */
    public function actionCreate()
    {
        $model = new Like;

        // Retrieve POST data
        $user_id = Yii::app()->request->getPost('user_id');
        $post_id = Yii::app()->request->getPost('post_id');

        // Assign attributes to the model
        $model->user_id = $user_id;
        $model->post_id = $post_id;

        // Save like
        if ($model->save()) {
            // Return JSON response
            $this->jsonResponse(array(
                'message' => 'Like successful.',
                'like' => $model->attributes,
            ));
        } else {
            // Return validation errors
            $this->jsonResponse(array(
                'message' => 'Failed to like.',
                'errors' => $model->getErrors(),
            ), 400);
        }
    }

    /**
     * Deletes a particular like model based on post_id and user_id.
     */
    public function actionDelete()
    {
        $user_id = Yii::app()->request->getPost('user_id');
        $post_id = Yii::app()->request->getPost('post_id');

        if (empty($post_id) || empty($user_id)) {
            // Return error if post_id or user_id is missing
            $this->jsonResponse(array(
                'message' => 'Post ID and User ID are required.',
            ), 400);
            return;
        }

        // Find the existing like model by post_id and user_id
        $model = Like::model()->findByAttributes(array('post_id' => $post_id, 'user_id' => $user_id));

        if ($model === null) {
            // Return error if like not found
            $this->jsonResponse(array(
                'message' => 'Like not found.',
            ), 404);
            return;
        }

        // Delete the like
        if ($model->delete()) {
            $this->jsonResponse(array(
                'message' => 'Like deleted successfully.',
            ));
        } else {
            $this->jsonResponse(array(
                'message' => 'Failed to delete the like.',
            ), 500);
        }
    }

    /**
     * Counts the number of likes for a particular post.
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

        // Find all likes by post_id
        $likes = Like::model()->findAllByAttributes(array('post_id' => $post_id));
        $count = count($likes);

        // Return the likes count data
        $this->jsonResponse(array(
            'count' => $count,
        ));
    }

    /**
     * Checks if a user has liked a particular post.
     */
    public function actionGetUserLike()
    {
        $post_id = Yii::app()->request->getPost('post_id');
        $user_id = Yii::app()->request->getPost('user_id');

        if (empty($post_id) || empty($user_id)) {
            // Return error if post_id or user_id is missing
            $this->jsonResponse(array(
                'message' => 'Post ID and User ID are required.',
            ), 400);
            return;
        }

        // Find like by post_id and user_id
        $like = Like::model()->findByAttributes(array('post_id' => $post_id, 'user_id' => $user_id));

        if ($like === null) {
            // Return if user has not liked the post
            $this->jsonResponse(array(
                'message' => 'User has no like for this post.',
                'like' => false,
            ));
            return;
        }

        // Return the like status
        $this->jsonResponse(array(
            'like' => true,
        ));
    }
}
