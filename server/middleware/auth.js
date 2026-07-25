import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Verifies the Bearer JWT issued by this server.
 * Attaches decoded payload to req.user.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { userId, email, role, iat, exp }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Role-based access control guard.
 * Must be used AFTER requireAuth.
 * Usage: requireRole('super_admin')  or  requireRole('super_admin', 'manager')
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    next();
  };
}

/**
 * Fetches the full MongoDB user doc and attaches to req.adminUser.
 * Ensures the token holder still exists and hasn't been blocked.
 */
export async function attachUser(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user || user.isBlocked || user.status !== 'approved') {
      return res.status(403).json({ error: 'Account is not active.' });
    }
    req.adminUser = user;
    next();
  } catch {
    return res.status(500).json({ error: 'Server error.' });
  }
}
