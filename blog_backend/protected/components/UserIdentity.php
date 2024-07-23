<?php

/**
 * UserIdentity represents the data needed to identify a user.
 * It contains the authentication method that checks if the provided
 * data can identify the user.
 */
class UserIdentity extends CUserIdentity
{
    /**
     * @var int The ID of the authenticated user.
     */
    private $_id;

    /**
     * Authenticates a user.
     *
     * @return bool Whether authentication succeeds.
     */
    public function authenticate()
    {
        // Find the user by the provided username
        $user = User::model()->findByAttributes(array('username' => $this->username));

        if ($user === null) {
            // Username is invalid
            $this->errorCode = self::ERROR_USERNAME_INVALID;
        } elseif (!CPasswordHelper::verifyPassword($this->password, $user->password)) {
            // Password is invalid
            $this->errorCode = self::ERROR_PASSWORD_INVALID;
        } else {
            // Authentication successful
            $this->_id = $user->id;
            $this->setState('username', $user->username);
            $this->errorCode = self::ERROR_NONE;
        }

        // Return whether the authentication was successful
        return !$this->errorCode;
    }

    /**
     * Returns the ID of the authenticated user.
     *
     * @return int The user ID.
     */
    public function getId()
    {
        return $this->_id;
    }
}
