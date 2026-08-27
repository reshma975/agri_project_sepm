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

      const user = await User.findById(decoded.id).select('-passwordHash');

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Normalize user.roles for multi-role support
      if (!user.roles || user.roles.length === 0) {
        user.roles = user.role ? [user.role] : ['FARMER'];
      }

      // Active role from the token's current session
      const activeRole = decoded.role || user.roles[0];
      req.currentRole = activeRole;
      user.role = activeRole; // Backward compatibility for controllers reading req.user.role
      req.user = user;

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
    const activeRole = req.currentRole || req.user?.role;
    const userRoles = req.user?.roles || (req.user?.role ? [req.user.role] : []);

    // Verify that the active session role matches AND the user actually possesses this role
    const hasRole = roles.includes(activeRole) && userRoles.some((r) => roles.includes(r));

    if (!req.user || !hasRole) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] role(s)`
      });
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'farmsetu_jwt_fallback_secret');
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user) {
        if (!user.roles || user.roles.length === 0) {
          user.roles = user.role ? [user.role] : ['FARMER'];
        }
        req.user = user;
        req.currentRole = decoded.role || user.roles[0];
      }
    } catch (e) {
      // Pass through without req.user
    }
  }
  next();
};
