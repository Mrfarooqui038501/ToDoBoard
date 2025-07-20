Collaborative To-Do Board
A real-time, collaborative task management application built with React, Express, MongoDB, and Socket.IO. Users can register, log in, create tasks, assign them, track progress on a Kanban board, and view activity logs, with conflict resolution for concurrent edits.
Features
1. User Authentication

Register: Users can create an account with a username and password.
Login: Authenticated users receive a JWT token stored in localStorage for secure access to protected routes.
Security: Passwords are hashed using bcrypt, and JWT tokens are verified using a secret key.

2. Task Management

Create Tasks: Users can add tasks with a title, description, and priority (Low, Medium, High).
Edit Tasks: Update task details (title, description, priority, status) with version control to prevent conflicts.
Delete Tasks: Remove tasks, with actions logged in the activity log.
Smart Assign: Automatically assign tasks to the user with the fewest active tasks (excluding "Done" tasks).
Drag-and-Drop: Move tasks between "Todo," "In Progress," and "Done" columns on the Kanban board using react-dnd.

3. Real-Time Collaboration

Socket.IO Integration: Real-time updates for task changes (create, update, delete, assign) are broadcast to all connected clients.
Activity Logs: Actions (create, update, delete, smart assign) are logged and displayed in real-time, showing the user, action, and timestamp.
Conflict Resolution: Detects concurrent edits (using task versioning) and prompts users to choose between conflicting versions.

4. Kanban Board

Columns: Tasks are organized into "Todo," "In Progress," and "Done" columns.
Visual Feedback: Columns highlight during drag-and-drop, and tasks display priority and assignee information.

5. Activity Logging

Logs All Actions: Tracks task creation, updates, deletions, and smart assignments with usernames and timestamps.
Professional Display: Uses "System" as a fallback if a username is unavailable, avoiding unprofessional terms like "Unknown."
Real-Time Updates: Logs are updated in real-time via Socket.IO and fetched from the backend on page load.

Setup
Prerequisites

Node.js (v20.14.0 or later)
MongoDB (local or Atlas)
npm

Installation

Clone the Repository:
git clone <repository-url>
cd todo-board


Backend Setup:
cd backend
npm install

Create a .env file in backend:
MONGODB_URI=mongodb://localhost:27017/tododb
JWT_SECRET=your_jwt_secret_key
PORT=5000

Start the backend:
nodemon server.js


Frontend Setup:
cd frontend
npm install
npm run dev

The app runs at http://localhost:5173.


Usage

Register/Login: Access /register or /login to create or access an account.
Manage Tasks: On the Kanban board (/board), create tasks, drag them between columns, edit, delete, or smart-assign them.
View Activity Logs: Check the Activity Log section for real-time updates on all actions.
Resolve Conflicts: If a conflict is detected, choose a version to keep or cancel.

Technologies

Frontend: React, React Router, React DnD, Axios, Socket.IO Client
Backend: Express, MongoDB (Mongoose), Socket.IO, JWT, Bcrypt
Styling: CSS with responsive design
Real-Time: Socket.IO for task updates and activity logs

API Endpoints

POST /api/auth/register: Register a new user.
POST /api/auth/login: Log in and receive a JWT token.
GET /api/tasks: Fetch all tasks.
POST /api/tasks: Create a new task.
PUT /api/tasks/:id: Update a task.
DELETE /api/tasks/:id: Delete a task.
POST /api/tasks/smart-assign/:id: Smart-assign a task.
GET /api/actions: Fetch activity logs.

Known Issues

Authentication Errors: Ensure the JWT token is valid and matches the JWT_SECRET.
Server Errors: Check MongoDB connection and task/user IDs for delete operations.
Activity Logs: Ensure logs populate usernames correctly by verifying user data in MongoDB.

Future Improvements

Add user profile management.
Implement task due dates and notifications.
Enhance conflict resolution UI with diffs.
Add pagination for activity logs.
