// src/middlewares/verifyRole.js - UPDATED VERSION
import jwt from "jsonwebtoken";

export const verifyRole = (allowedRole, multiple = false) => (req, res, next) => {
  console.log('Role Verification Debug:', {
    allowedRole,
    multiple,
    hasUser: !!req.user,
    userRole: req.user?.role,
    hasAuthHeader: !!req.headers.authorization
  });

  // Check if user was already authenticated by isLoggedin middleware
  if (req.user) {
    console.log('User already authenticated by isLoggedin middleware:', {
      userId: req.user.id,
      userRole: req.user.role,
      userName: `${req.user.fname} ${req.user.lname}`
    });

    // Proceed with role verification using existing req.user
    if (multiple) {
      const allowedRoles = allowedRole.split(",");
      console.log('Checking multiple roles:', {
        allowedRoles,
        userRole: req.user.role,
        isAllowed: allowedRoles.includes(req.user.role)
      });

      if (allowedRoles.includes(req.user.role)) {
        console.log('Role verification passed (multiple)');
        return next();
      } else {
        console.log('Role verification failed (multiple)');
        return res.status(403).json({ 
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}` 
        });
      }
    } else {
      console.log('Checking single role:', {
        allowedRole,
        userRole: req.user.role,
        matches: req.user.role === allowedRole
      });

      if (req.user.role === allowedRole) {
        console.log('Role verification passed (single)');
        return next();
      } else {
        console.log('Role verification failed (single)');
        return res.status(403).json({ 
          message: `Access denied. Required role: ${allowedRole}. Your role: ${req.user.role}` 
        });
      }
    }
  }

  // Fallback: If no user in req (shouldn't happen if isLoggedin runs first)
  console.log('No user found in req.user - attempting direct token verification');

  if (!req.headers.authorization) {
    console.log('No authorization header in verifyRole');
    return res.status(401).json({ message: "Unauthorized request" });
  }

  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    console.log('No token in verifyRole');
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified in verifyRole:', {
      userId: decoded.payload?.user?.id || decoded.payload?.id,
      userRole: decoded.payload?.user?.role || decoded.payload?.role
    });
    
    // Set user consistently with isLoggedin middleware
    if (decoded.payload.user) {
      req.user = decoded.payload.user;
    } else {
      req.user = decoded.payload;
    }
    
    if (multiple) {
      const allowedRoles = allowedRole.split(",");
      console.log('Checking multiple roles:', {
        allowedRoles,
        userRole: req.user.role,
        isAllowed: allowedRoles.includes(req.user.role)
      });

      if (allowedRoles.includes(req.user.role)) {
        console.log('Role verification passed (multiple)');
        next();
      } else {
        console.log('Role verification failed (multiple)');
        res.status(403).json({ 
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}` 
        });
      }
    } else {
      console.log('Checking single role:', {
        allowedRole,
        userRole: req.user.role,
        matches: req.user.role === allowedRole
      });

      if (req.user.role === allowedRole) {
        console.log('Role verification passed (single)');
        next();
      } else {
        console.log('Role verification failed (single)');
        res.status(403).json({ 
          message: `Access denied. Required role: ${allowedRole}. Your role: ${req.user.role}` 
        });
      }
    }
  } catch (err) {
    console.error('JWT verification error in verifyRole:', err.message);
    res.status(400).json({ message: "invalid token" });
  }
};

export default verifyRole;