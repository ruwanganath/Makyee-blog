# Makyee-blog

This is related to an assessment requirement requested by Makyee

# Blog Application

A blog application developed using the Yii 1.1 framework for the backend and React for the frontend, utilizing a MySQL database.

## Installation Requirements

### Frontend

- **Node.js**: v21.7.1 or later recommended
- **npm**: 10.8.1 or later recommended

### Backend

- **PHP**: v8.2 or later recommended
- **Server**: XAMPP or any other suitable server with MySQL support

## Installation and Running the Application

### Clone the Repository

```bash
git clone git@github.com:ruwanganath/Makyee-blog.git
cd Makyee-blog
```

## Frontend Setup

- Navigate to the frontend folder and install dependencies:

```bash
cd frontend
npm install
```

- Start the server:

```bash
npm start
```

- Configure REST Api backend server:

change the Proxy API backend server URL settings in vite.config.ts file.

- Open the application in your browser:

The development server will start, and the application will be accessible at http://localhost:5174.

## Backend Setup

- Configure Apache:

If using XAMPP on Windows:
Edit the hosts file located at C:\Windows\System32\drivers\etc\hosts and add:

127.0.0.1 dev.blog_backend.com

- Edit the Apache virtual hosts configuration file located at C:\xampp\apache\conf\extra\httpd-vhosts.conf and add:
  (if the cloned folder in C: drive )
  <VirtualHost \*:80>
  DocumentRoot "C:/makyee-blog/blog_backend"
  ServerName dev.blog_backend
  ServerAlias dev.blog_backend
  <Directory "C:/makyee-blog/blog_backend">
  AllowOverride All
  Require all Granted
  </Directory>
  </VirtualHost>

- Run Apache and MySQL servers:

Start the Apache and MySQL servers using the XAMPP control panel.

## Setting up the MySQL database:

Ensure the MySQL server is running:

On Unix-based systems:

```bash
sudo service mysql start
```

On systems using systemd:

```bash
sudo systemctl start mysql
```

- Method 1: Manual Setup

Open http://localhost/phpmyadmin/ in your web browser.
Manually set up the database and run the SQL script located in schema.makyee.sql to create tables.
Update the database.php file located at protected/config/database.php with your database connection string.
More info on Yii database configuration
https://www.yiiframework.com/doc/blog/1.1/en/prototype.database

- Method 2: Automated Setup

First, update the database.php file located at protected/config/database.php with your database connection string.
Then, run the setup command in the project folder blog_backend:

```bash
php protected/yiic setup
```

This command will connect to your MySQL server using the credentials provided in your main.php configuration file and execute the setup SQL queries if the database and tables don't already exist.

## For the Second part of this blog application to have a public page with auto update feature using websockets

It has been assumed all public posts which have atleast 1 comment and the user has atleast 2 posts under the users name. To implement this part, at the backend, a Dependency Manager for PHP has used (Composer and composer.json contains all dependencies - Rachet and websocket to manage the backend fully PHP to run websockets in the app) and please follow the documentation to setup composer in the project and install dependencies.

# License

This project is licensed under the MIT License.

# Acknowledgements

Yii Framework: https://www.yiiframework.com
React: https://reactjs.org
Composer: https://getcomposer.org/
