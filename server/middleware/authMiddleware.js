import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const secret = process.env.JWT_SECRET || 'reserverdark_default_jwt_secret_key';
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const secret = process.env.JWT_SECRET || 'reserverdark_default_jwt_secret_key';
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select('-password');
      if (user && !user.isBlocked) {
        req.user = user;
      }
    }
  } catch {
    // Ignore invalid/expired token on optional auth routes
  }
  next();
};