require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { initSocket } = require('./config/socket');
const app = express();
const server = http.createServer(app);


// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));
// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/project');
const executeFileRoutes = require('./routes/executeFile');
const inviteRoutes = require('./routes/invite');
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes); // projectRoutes is a function that takes in a request and a response
app.use('/api/execute', executeFileRoutes); // executeFileRoutes is a function that takes in a request and a response
app.use('/api/invite', inviteRoutes);
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

mongoose.set('strictPopulate', false);
initSocket(server);
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
