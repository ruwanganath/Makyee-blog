<?php

// This is the configuration for the yiic console application.
// Any writable CConsoleApplication properties can be configured here.
return array(
    // The base path of the application
    'basePath' => dirname(__FILE__) . DIRECTORY_SEPARATOR . '..',
    
    // The name of the application
    'name' => 'Makyee Blog App',

    // Preloading the 'log' component for logging purposes
    'preload' => array('log'),

    // Application components
    'components' => array(

        // Database settings are configured in a separate file 'database.php'
        'db' => require(dirname(__FILE__) . '/database.php'),

        // Logging configuration
        'log' => array(
            // Using CLogRouter to route log messages
            'class' => 'CLogRouter',
            'routes' => array(
                // Using CFileLogRoute to log error and warning messages to a file
                array(
                    'class' => 'CFileLogRoute',
                    'levels' => 'error, warning',
                ),
            ),
        ),
    ),

    // Command map configuration
    'commandMap' => array(
        // Mapping 'setup' command to the SetupCommand class
        'setup' => array(
            'class' => 'application.commands.SetupCommand',
        ),
    ),
);
