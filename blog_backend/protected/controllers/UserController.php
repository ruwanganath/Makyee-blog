<?php

class UserController extends Controller
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
     * Registers a new user.
     */
    public function actionRegister()
    {
        $model = new User;

        // Retrieve POST data for registration
        $username = Yii::app()->request->getPost('username');
        $email = Yii::app()->request->getPost('email');
        $password = Yii::app()->request->getPost('password');

        // Assign attributes to the model
        $model->username = $username;
        $model->email = $email;
        $model->password = CPasswordHelper::hashPassword($password); // Hash password

        // Generate verification token
        $model->verification_token = Yii::app()->securityManager->generateRandomString(10);
        // Set other attributes as needed
        $model->verified = 0; // Assuming 0 means user is not verified initially

        // Validate and save user
        if ($model->save()) {
            // Optionally, send verification email with $model->verification_token

            // Return JSON response
            $this->jsonResponse(array(
                'success' => true,
                'message' => 'Registration successful, please click the link below to verify your account.',
                'userId' => $model->id,
                'verificationToken' => $model->verification_token,
            ));
        } else {
            // Return validation errors
            $this->jsonResponse(array(
                'success' => false,
                'message' => 'Failed to register user.',
                'errors' => $model->getErrors(),
            ), 400);
        }
    }

    /**
     * Authenticates the user.
     */
    public function actionAuthenticate()
    {
        $username = Yii::app()->request->getPost('username');
        $password = Yii::app()->request->getPost('password');
    
        // Check if username or password is empty
        if (empty($username) || empty($password)) {
            $this->jsonResponse(array(
                'message' => 'Username and password are required.',
                'success' => false
            ), 400);
            return;
        }
    
        // Find user by username
        $user = User::model()->findByAttributes(array('username' => $username));
    
        // Check if user exists
        if ($user === null) {
            $this->jsonResponse(array(
                'message' => 'Invalid username or password.',
                'success' => false
            ), 401);
            return;
        }
    
        // Check if user is verified
        if ($user->verified != 1) {
            $this->jsonResponse(array(
                'message' => 'User is not verified. Authentication failed.',
                'success' => false,
                'verification_token' => $user->verification_token,
                'verificationLink' => true
            ), 403);
            return;
        }
    
        // Validate password
        $identity = new UserIdentity($username, $password);
    
        if ($identity->authenticate()) {
            Yii::app()->user->login($identity);
            $this->jsonResponse(array(
                'message' => 'User authenticated successfully.',
                'userId' => $identity->getId(),
                'success' => true
            ));
        } else {
            $this->jsonResponse(array(
                'message' => 'Invalid username or password.',
                'success' => false
            ), 401);
        }
    }

    /**
     * Verifies user using verification token.
     */
    public function actionVerifyToken()
    {
        $token = Yii::app()->request->getPost('verification_token');

        // Find user by verification token
        $user = User::model()->findByAttributes(array('verification_token' => $token));

        if ($user !== null) {
            // User found, update verification status
            $user->verified = 1; // Set verified status to 1 (or true)
            $user->verification_token = null; // Clear verification token
            $user->save();

            // Return JSON response
            $this->jsonResponse(array(
                'success' => true,
                'message' => 'User verified successfully. Please login to continue.',
                'userId' => $user->id,
            ));
        } else {
            // User not found or token invalid
            $this->jsonResponse(array(
                'message' => 'Invalid verification token.',
                'success' => false
            ), 404);
        }
    }

    /**
     * Performs Ajax validation for email uniqueness.
     */
    public function actionValidateEmail()
    {
        $email = Yii::app()->request->getPost('email');

        // Check if email already exists in the database
        $existingUser = User::model()->findByAttributes(array('email' => $email));
        
        if ($existingUser !== null) {
            // Email is already in use
            $this->jsonResponse(array(
                'status' => false,
                'message' => 'This email is already registered.',
            ));
        } else {
            // Email is available
            $this->jsonResponse(array(
                'status' => true,
                'message' => 'Email is available.',
            ));
        }
    }

    /**
     * Gets username by user ID.
     */
    public function actionGetUser()
    {
        $user_id = Yii::app()->request->getPost('user_id');

        // Check if user ID exists in the database
        $user = User::model()->findByPk($user_id);
        
        if ($user !== null) {
            // User exists
            $this->jsonResponse(array(
                'status' => true,
                'message' => 'User exists',
                'username' => $user->username
            ));
        } else {
            // User does not exist
            $this->jsonResponse(array(
                'status' => false,
                'message' => 'User does not exist',
                'username' => null
            ));
        }
    }

    /**
     * Gets user ID by username.
     */
    public function actionGetUsername()
    {
        $username = Yii::app()->request->getPost('username');

        // Validate the input
        if (empty($username)) {
            $this->jsonResponse(array(
                'status' => false,
                'message' => 'Username is required',
                'user_id' => null
            ));
            return;
        }

        // Check if the username exists in the database
        $user = User::model()->findByAttributes(array('username' => $username));
        
        if ($user !== null) {
            // User exists
            $this->jsonResponse(array(
                'status' => true,
                'message' => 'User exists',
                'user_id' => $user->id
            ));
        } else {
            // User does not exist
            $this->jsonResponse(array(
                'status' => false,
                'message' => 'User does not exist.',
                'user_id' => null
            ));
        }
    }
}
?>
