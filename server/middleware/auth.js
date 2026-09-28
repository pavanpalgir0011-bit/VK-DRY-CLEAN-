const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'vk_dry_clean_secure_jwt_secret_token_2026_xyz';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) {
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
        }
      }
    } catch (jwtErr) {
      // If JWT verify fails, check if token looks like Firebase token
      // or if decoded has sub/email
      console.warn('JWT verification notice:', jwtErr.message);
    }

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    next();
  }
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login to continue.',
    });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login as admin.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
    });
  }

  next();
};

module.exports = {
  authenticate,
  requireAuth,
  requireAdmin,
};
