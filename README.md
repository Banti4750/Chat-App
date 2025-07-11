# Chat-App-Redis

This is a real-time chat application built with a microservices architecture, utilizing Node.js (Express), TypeScript, MongoDB, Redis, and React. The application is designed to provide a seamless chat experience with features like user authentication, real-time messaging, and chat management.

## Features

-   **User Authentication**: Secure user login and registration.
-   **Real-time Messaging**: Instant message delivery using WebSockets.
-   **Chat Management**: Create and manage individual and group chats.
-   **Microservices Architecture**: Backend split into independent services (Chat, User, Mail).
-   **Scalable**: Designed with Redis for caching and message brokering for scalability.

## Technologies Used

### Backend

-   **Node.js**: JavaScript runtime environment.
-   **Express.js**: Web application framework for Node.js.
-   **TypeScript**: Superset of JavaScript that compiles to plain JavaScript.
-   **MongoDB**: NoSQL database for storing chat and user data.
-   **Mongoose**: MongoDB object data modeling (ODM) for Node.js.
-   **Redis**: In-memory data structure store, used for caching and potentially session management/message brokering.
-   **JWT (JSON Web Tokens)**: For secure authentication.
-   **Axios**: Promise-based HTTP client for the browser and Node.js.
-   **Dotenv**: Loads environment variables from a `.env` file.
-   **Nodemon**: Utility that monitors for changes in your source and automatically restarts your server.
-   **Concurrently**: Run multiple commands concurrently.

### Frontend

-   **React**: JavaScript library for building user interfaces.
-   **Vite**: Next-generation frontend tooling.
-   **TypeScript**: For type-safe React components.
-   **Axios**: For making HTTP requests to the backend.

## Project Structure

The project is organized into `backend` and `frontend` directories. The `backend` directory contains three microservices: `chat`, `user`, and `mail`.

```
Chat-App-Redis/
├── backend/
│   ├── chat/             # Chat service (handles chat creation, messages)
│   ├── mail/             # Mail service (for sending emails, e.g., OTPs)
│   └── user/             # User service (handles user authentication, profiles)
├── frontend/           # React frontend application
└── README.md
```

## Setup Instructions

### Prerequisites

-   Node.js (v14 or higher)
-   npm (Node Package Manager)
-   MongoDB instance (local or cloud-based)
-   Redis instance (local or cloud-based)

### 1. Clone the repository

```bash
git clone <repository-url>
cd Chat-App-Redis
```

### 2. Backend Setup

Navigate to each backend service directory (`backend/chat`, `backend/user`, `backend/mail`) and install dependencies, then create a `.env` file.

#### Common `.env` variables for Backend Services

Create a `.env` file in `backend/chat`, `backend/user`, and `backend/mail` with the following structure. Adjust values as per your setup.

```env
PORT=5000 # Or 5001, 5002, etc. for different services
MONGO_URI=mongodb://localhost:27017/chat_app
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY
REDIS_URL=redis://localhost:6379

# Specific to Chat Service
USER_SERVICE=http://localhost:5000 # URL of the user service

# Specific to Mail Service (example)
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USER=your_email@example.com
MAIL_PASS=your_email_password
```

#### Install Dependencies and Build Each Service

```bash
# For Chat Service
cd backend/chat
npm install
npm run build

# For User Service
cd ../user
npm install
npm run build

# For Mail Service
cd ../mail
npm install
npm run build
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

#### Frontend `.env` variables

Create a `.env` file in the `frontend` directory.

```env
VITE_BACKEND_URL=http://localhost:5000 # Adjust to your backend user service URL
```

## Running the Application

### 1. Start Backend Services

Open three separate terminal windows. In each, navigate to a backend service directory and run the development server:

```bash
# Terminal 1: Chat Service
cd backend/chat
npm run dev

# Terminal 2: User Service
cd backend/user
npm run dev

# Terminal 3: Mail Service (if applicable and needed for your current testing)
cd backend/mail
npm run dev
```

### 2. Start Frontend Application

Open another terminal window, navigate to the `frontend` directory, and start the React development server:

```bash
cd frontend
npm run dev
```

The frontend application should now be accessible at `http://localhost:5173` (or another port if Vite assigns a different one). The backend services will be running on their configured ports (e.g., 5000, 5001, 5002).

## API Endpoints (Examples)

### User Service

-   `POST /api/v1/user/register`
-   `POST /api/v1/user/login`
-   `GET /api/v1/user/:id`

### Chat Service

-   `POST /api/v1/chat/create/chat`
-   `GET /api/v1/chat/all`
-   `POST /api/v1/chat/message/new`

## Contributing

Feel free to fork the repository, create a new branch, and submit pull requests. Any contributions are welcome!

## License

This project is licensed under the MIT License.