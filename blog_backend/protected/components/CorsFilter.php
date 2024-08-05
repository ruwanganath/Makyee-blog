<?php
// Define a custom filter class for handling CORS (Cross-Origin Resource Sharing)
class CorsFilter extends CFilter
{
    // Called before the action method is executed
    protected function preFilter($filterChain)
    {
        // Check if the request is an OPTIONS request (commonly used for CORS preflight checks)
        if ($this->isOptionsRequest()) {
            // Set CORS headers to allow any origin
            header('Access-Control-Allow-Origin: *');
            // Specify allowed HTTP methods
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            // Specify allowed request headers
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
            // Indicate that credentials (cookies, authorization headers, etc.) can be included
            header('Access-Control-Allow-Credentials: true');
            // Set max age for caching the preflight response (1 day)
            header('Access-Control-Max-Age: 86400');

            // Terminate the application to prevent further processing
            Yii::app()->end();
        }

        // Continue with the normal filtering process
        return parent::preFilter($filterChain);
    }

    // Called after the action method is executed
    protected function postFilter($filterChain)
    {
        // Set CORS headers to allow any origin
        header('Access-Control-Allow-Origin: *');
        // Specify allowed HTTP methods
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        // Specify allowed request headers
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        // Indicate that credentials (cookies, authorization headers, etc.) can be included
        header('Access-Control-Allow-Credentials: true');
    }

    // Helper method to check if the current request is an OPTIONS request
    private function isOptionsRequest()
    {
        // Check the request type from the Yii application
        return Yii::app()->request->getRequestType() === 'OPTIONS';
    }
}
