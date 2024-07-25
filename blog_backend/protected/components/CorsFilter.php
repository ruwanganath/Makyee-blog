<?php

class CorsFilter extends CFilter
{
    protected function preFilter($filterChain)
    {
        $allowedOrigins = ['http://localhost:5173']; // Add your frontend URL here
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

        // Check if the origin is allowed
        if (in_array($origin, $allowedOrigins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
        } else {
            header('Access-Control-Allow-Origin: none');
        }

        // Handle OPTIONS request
        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            Yii::app()->end();
        }

        return parent::preFilter($filterChain);
    }
}
