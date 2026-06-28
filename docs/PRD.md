# Juno Product Requirements Document

## 1. Product Overview

Juno is a full-stack task management application that helps users organize, prioritize, and track their personal tasks.

The project demonstrates practical full-stack development skills, including authentication, REST APIs, database design, CRUD operations, responsive UI development, Docker, and deployment.

## 2. Problem Statement

Users need a simple and reliable way to organize tasks, understand their current workload, and track progress without unnecessary complexity.

Juno provides one centralized dashboard for creating, managing, searching, filtering, and reviewing tasks.

## 3. Target Users

- Students managing assignments and personal work
- Professionals tracking daily tasks
- Individuals who want a lightweight productivity tool

## 4. Core User Flow

1. A user creates an account or logs in.
2. The user creates a task.
3. The user assigns its status and priority.
4. The user edits, completes, or deletes the task.
5. The user searches, filters, and sorts tasks.
6. The dashboard displays task statistics and progress.

## 5. MVP Features

### Authentication

- User registration
- User login and logout
- JWT-based authentication
- Protected application routes
- Each user can access only their own tasks

### Task Management

- Create a task
- View all tasks
- Edit a task
- Delete a task
- Optional task description
- Optional due date

### Task Status

- To Do
- In Progress
- Done

### Task Priority

- Low
- Medium
- High

### Search, Filter, and Sort

- Search by task title
- Filter by status
- Filter by priority
- Sort by creation date
- Sort by due date
- Sort by priority

### Dashboard

- Total number of tasks
- Number of To Do tasks
- Number of In Progress tasks
- Number of completed tasks
- Completion percentage

### User Experience

- Responsive desktop and mobile layout
- Loading states
- Empty states
- Form validation
- Clear error messages

## 6. Out of Scope for the MVP

The first version will not include:

- Team workspaces
- Role-based permissions
- Real-time collaboration
- Subtasks
- File attachments
- Notifications
- Social login
- Recurring tasks

These features may be considered after the MVP is complete.

## 7. MVP Success Criteria

The MVP is complete when:

- A user can register, log in, and log out.
- Authentication persists securely between page refreshes.
- A user can create, view, edit, and delete tasks.
- Users cannot access another user's tasks.
- Tasks can be searched, filtered, and sorted.
- Dashboard statistics update when tasks change.
- The application works on desktop and mobile screens.
- The application can run locally using Docker.
- The deployed application is accessible through a public URL.