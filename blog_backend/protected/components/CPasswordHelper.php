<?php

class CPasswordHelper
{
    /**
     * Hashes a password using the BCRYPT algorithm.
     *
     * @param string $password The password to hash.
     * @return string The hashed password.
     */
    public static function hashPassword($password)
    {
        // Hash the password using the BCRYPT algorithm
        return password_hash($password, PASSWORD_BCRYPT);
    }

    /**
     * Verifies a password against a given hash.
     *
     * @param string $password The password to verify.
     * @param string $hash The hash to verify against.
     * @return bool True if the password matches the hash, false otherwise.
     */
    public static function verifyPassword($password, $hash)
    {
        // Verify the password against the provided hash
        return password_verify($password, $hash);
    }
}
