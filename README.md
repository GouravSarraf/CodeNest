# CodeNest

A modern, collaborative code editor and project management platform built with React and Node.js.

## Features

- 🚀 **Real-time Code Editor**
  - Syntax highlighting for multiple languages
  - Auto-completion and code suggestions
  - Line numbers and code formatting
  - Real-time code execution

- 📁 **Project Management**
  - Hierarchical file and folder structure
  - Drag-and-drop file organization
  - Multiple project support
  - File content caching with Redis

- 🔒 **Security**
  - JWT-based authentication
  - Secure user authorization
  - Protected routes and resources
  - Data privacy controls

- ⚡ **Performance**
  - Redis caching for optimized file access
  - Efficient database queries
  - Fast file operations
  - Responsive UI

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Redis (Upstash)
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Redis (Upstash account)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/codecollab.git
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# Backend (.env)
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url
REDIS_TOKEN=your_redis_token

# Frontend (.env)
VITE_API_URL=http://localhost:5000
```

4. Start the development servers
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd ../frontend
npm run dev
```

## Usage

1. Register a new account or login
2. Create a new project
3. Add files and folders to organize your code
4. Use the code editor to write and execute code
5. Collaborate with team members

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/codecollab](https://github.com/yourusername/codecollab) 
