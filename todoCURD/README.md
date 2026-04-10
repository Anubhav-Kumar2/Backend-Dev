# Todo API with Full Authentication

A complete RESTful API built with Express, MongoDB, and JSON Web Token (JWT) Authentication. This application replaces the old console-based Todo system with a secure web server.

## Features Let's verify:
- **Authentication**: User Registration and Login with encrypted passwords (bcryptjs).
- **Security**: JWT-based protected routes.
- **Todo CRUD**: Full Create, Read, Update, Delete functionality for Todos.
- **Data Isolation**: A user can only access and modify their own created Todos.

---

## 1. Prerequisites

Before running the project, make sure you have:
1. **Node.js** installed on your system.
2. **MongoDB** installed locally (or a MongoDB Atlas connection string). Make sure your local MongoDB server service is running.

---

## 2. Starting the Application

1. Open your terminal in this project folder (`todo curd operation assingment`).
2. Install the necessary packages (if you haven't already):
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   node index.js
   ```
4. You should see the following success messages in your terminal:
   ```
   Server is running on port 5000
   - API Auth endpoints at: http://localhost:5000/api/auth
   - API Todo endpoints at: http://localhost:5000/api/todos
   MongoDB Connected: 127.0.0.1
   ```

---

## 3. How to Use the API (Using Postman)

You will need a testing tool like **Postman** (or ThunderClient directly in VS Code) to send requests to your API.

### Step 1: Register a New User
*You must create an account to start adding todos.*
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/register`
- **Body** (select `raw` and `JSON`):
  ```json
  {
      "username": "johndoe",
      "password": "mypassword123"
  }
  ```
- **Hit Send!** You will get a response containing your user `_id`, `username`, and crucially, a **`token`**. 

### Step 2: Login (If returning)
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Body** (same as Register):
  ```json
  {
      "username": "johndoe",
      "password": "mypassword123"
  }
  ```
- **Hit Send!** You will retrieve your **`token`**.

---

### Step 3: Add the Token to Postman
*Your token acts as your digital ID card. You must attach it to your following requests so the server knows who you are.*
1. In Postman, open a new Request tab.
2. Go to the **Authorization** tab.
3. In the "Type" dropdown, select **Bearer Token**.
4. Paste the `token` string you received from Register/Login into the **Token** field.

### Step 4: Create a Todo
*Make sure you applied Step 3 so Postman sends your token.*
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/todos`
- **Body** (select `raw` and `JSON`):
  ```json
  {
      "title": "Learn Express Authentication",
      "description": "Understand JWT generation"
  }
  ```
- **Hit Send!** It will save the todo into MongoDB attached specifically to your User.

### Step 5: View Your Todos
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/todos`
*(Don't forget to enable Bearer Token in Authentication tab)*
- **Hit Send!** This will return a list of all Todos created by the logged-in user.

### Step 6: Update & Delete
- **Update Todo**: `PUT http://localhost:5000/api/todos/<insert_todo_id>` 
  (Pass updated `title` and `description` in JSON body).
- **Mark Complete**: `PATCH http://localhost:5000/api/todos/<insert_todo_id>/complete`
- **Delete Todo**: `DELETE http://localhost:5000/api/todos/<insert_todo_id>`
*(All of these require the Bearer Token!)*
