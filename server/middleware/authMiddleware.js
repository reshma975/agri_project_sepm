import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'farmsetu_jwt_fallback_secret',
    { expiresIn: '30d' }
  );
};

export const requireAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'farmsetu_jwt_fallback_secret'
      );

      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] role(s)`
      });
    }
    next();
  };
};
