// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyAccessToken = async (req, res, next) => {
  try {
    
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(500).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = {
  verifyAccessToken
};
