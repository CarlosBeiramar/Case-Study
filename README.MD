# Overview

Develop a backend system for a Course Management System using TypeScript and Node.js. The system needs to handle course data management and persist data in JSON files instead of a traditional database.

## Objectives

1. Create a RESTful API for managing courses.
2. Implement data persistence using JSON files.
3. Ensure type safety and code quality using TypeScript.
4. Implement proper error handling and logging.
5. Create a scalable and maintainable architecture.

## Endpoints

### **Courses**

- **GET** `/api/courses` - Retrieve all courses
- **GET** `/api/courses/:courseId` - Retrieve a specific course by ID
- **POST** `/api/courses` - Create a new course
- **PUT** `/api/courses/:courseId` - Update a specific course by ID
- **DELETE** `/api/courses/:courseId` - Delete a specific course by ID

### **Modules**

- **GET** `/api/courses/:courseId/modules` - Retrieve all modules for a specific course
- **GET** `/api/courses/:courseId/modules/:moduleId` - Retrieve a specific module by ID within a course
- **POST** `/api/courses/:courseId/modules` - Create a new module within a course
- **PUT** `/api/courses/:courseId/modules/:moduleId` - Update a specific module by ID within a course
- **DELETE** `/api/courses/:courseId/modules/:moduleId` - Delete a specific module by ID within a course

### **Lessons**

- **GET** `/api/courses/:courseId/modules/:moduleId/lessons` - Retrieve all lessons for a specific module within a course
- **GET** `/api/courses/:courseId/modules/:moduleId/lessons/:lessonId` - Retrieve a specific lesson by ID within a module
- **POST** `/api/courses/:courseId/modules/:moduleId/lessons` - Create a new lesson within a module
- **PUT** `/api/courses/:courseId/modules/:moduleId/lessons/:lessonId` - Update a specific lesson by ID within a module
- **DELETE** `/api/courses/:courseId/modules/:moduleId/lessons/:lessonId` - Delete a specific lesson by ID within a module

## Project Checklist

- [x] Store all data in JSON files
- [x] Implement efficient read/write operations to these files
- [x] Implement global error-handling middleware.
- [x] Implement logging for all API requests and errors. (**Winston**)
- [x] Validate all input data using a validation library like Joi.
- [x] Write unit tests for all business logic.
- [x] Implement integration tests for API endpoints.
- [x] Add pagination for listing endpoints.
- [x] Implement rate limiting to prevent API abuse.
- [x] Create a Docker configuration for easy deployment.


## Getting Started

````
    docker build -t course_management .
`````

````
    docker run -p 3000:3000 course_management
````
