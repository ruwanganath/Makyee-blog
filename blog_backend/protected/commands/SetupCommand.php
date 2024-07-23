<?php

class SetupCommand extends CConsoleCommand
{
    /**
     * Main method to set up the database and tables.
     */
    public function actionIndex()
    {
        // Establish a connection to MySQL server
        $connection = new CDbConnection('mysql:host=localhost;', 'root', '');
        $connection->active = true;

        // Check if the database exists
        $checkDbQuery = "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'makyee_blog'";
        $command = $connection->createCommand($checkDbQuery);
        $result = $command->queryRow();

        if (!$result) {
            // Create the database if it does not exist
            $createDbQuery = "CREATE DATABASE makyee_blog";
            $command = $connection->createCommand($createDbQuery);
            $command->execute();
            echo "Database 'makyee_blog' created successfully.\n";
        }

        // Reconfigure the connection to use the new database
        $connection->active = false;
        $connection->connectionString = 'mysql:host=localhost;dbname=makyee_blog';
        $connection->active = true;

        // Begin a database transaction
        $transaction = $connection->beginTransaction();

        try {
            // SQL statements to create tables if they do not exist
            $tables = [
                "CREATE TABLE IF NOT EXISTS tbl_user (
                    id INT NOT NULL AUTO_INCREMENT,
                    username VARCHAR(50) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    verification_token VARCHAR(255) DEFAULT NULL,
                    verified TINYINT(1) NOT NULL DEFAULT '0',
                    PRIMARY KEY (id),
                    UNIQUE KEY email (email)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;",
                
                "CREATE TABLE IF NOT EXISTS tbl_post (
                    id INT NOT NULL AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    content TEXT NOT NULL,
                    public TINYINT(1) NOT NULL DEFAULT '0',
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    FOREIGN KEY (user_id) REFERENCES tbl_user(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;",
                
                "CREATE TABLE IF NOT EXISTS tbl_like (
                    id INT NOT NULL AUTO_INCREMENT,
                    post_id INT NOT NULL,
                    user_id INT NOT NULL,
                    PRIMARY KEY (id),
                    FOREIGN KEY (post_id) REFERENCES tbl_post(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES tbl_user(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;",
                
                "CREATE TABLE IF NOT EXISTS tbl_comment (
                    id INT NOT NULL AUTO_INCREMENT,
                    post_id INT NOT NULL,
                    user_id INT NOT NULL,
                    comment TEXT NOT NULL,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    FOREIGN KEY (post_id) REFERENCES tbl_post(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES tbl_user(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;"
            ];

            // Execute each table creation statement
            foreach ($tables as $table) {
                $command = $connection->createCommand($table);
                $command->execute();
            }

            // Commit the transaction upon success
            $transaction->commit();
            echo "Database setup completed successfully.\n";
        } catch (Exception $e) {
            // Roll back the transaction upon failure
            $transaction->rollBack();
            echo "Database setup failed: " . $e->getMessage() . "\n";
        }
    }
}
