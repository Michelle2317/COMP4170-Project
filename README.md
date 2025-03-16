# COMP4170-Project

## Description
This is a diary web application that allows users to create, update, view, and delete personal diary entries.

## Team Members and Tasks
- Michelle Ao
  - Task
- Julia Deng
  - Task
- Andrew Turitsa
  - Task

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
- Install [PostgreSQL](https://www.postgresql.org/download/).
- Create the database by running the following SQL command in pgAdmin. Or using the interface, right-click on the databases folder and then create < database.
```
CREATE DATABASE diary;
```

4. After connecting to database, set up the Database Tables using the schema.sql file.
- In the Query Tool, click on the Open File icon and select the schema.sql file.
- Click on the Execute button to run the schema.sql file.
  
5. Start the app or run with nodemon.
```
node index.js
# or if using nodemon:
nodemon index.js
``` 

6. Visit the app in your browser.
```
http://localhost:3000
```