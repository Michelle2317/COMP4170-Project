# COMP4170-Project

## Description

This is a diary web application that allows users to create, update, view, and delete personal diary entries.

## Team Members and Tasks

-   Michelle Ao
    -   README Documentation
    -   Database Management
    -   Backend Development
    -   Diary Functionality
-   Julia Deng
    -   Task
-   Andrew Turitsa
    -   Task

## How To Run The Application Locally

1. Download the folder or git clone the repo to your machine.

```
git clone https://github.com/Michelle2317/COMP4170-Project.git
```

2. Install dependencies.

```
npm install
```

3. Set up PostgreSQL.

-   Install [PostgreSQL](https://www.postgresql.org/download/).
-   After installing, run pgAdmin 4.

4. First, create the user by running the following SQL command using the Query Tool Workspace. Click execute and then restart pgAdmin 4.

```
CREATE USER project_user WITH PASSWORD 'deardiary';
```

5. Next, create the database by running the following SQL command using the Query Tool Workspace or in the Object Explorer tab, right-click on the databases folder and then create < database.

```
CREATE DATABASE diary;
```

6. Once the database "diary" is created. Run the following SQL command using the Query Tool Workspace.

```
GRANT ALL PRIVILEGES ON DATABASE diary TO project_user;
```

7. Open the Query Tool Workspace to connect to the database "diary" with the user "project_user" and password "deardiary". Then create the database tables by running the following SQL command. Click execute and go back to the Object Explorer tab. Open up the tabs inside the Servers until you find Tables under Schemas, right-click, refresh to see created tables.

```
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);
```

8. Start the app or run with nodemon.

```
node index.js
# or if using nodemon:
nodemon index.js
```

9. Visit the app in your browser.

```
http://localhost:3000
```
