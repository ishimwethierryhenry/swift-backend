// src/middlewares/verifyRole.js
import jwt from "jsonwebtoken";

export const verifyRole =
  (allowedRole, multiple = false) =>
  (req, res, next) => {
    console.log('Role Verification Debug:', {
      allowedRole,
      multiple,
      hasUser: !!req.user,
      userRole: req.user?.role
    });

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
        userId: decoded.payload?.user?.id,
        userRole: decoded.payload?.user?.role
      });
      
      req.user = decoded.payload.user;
      
      if (multiple) {
        const allowedRoles = allowedRole.split(",");
        console.log('Checking multiple roles:', {
          allowedRoles,
          userRole: req.user?.role,
          isAllowed: allowedRoles.includes(req.user?.role)
        });

        if (allowedRoles.includes(req.user?.role)) {
          console.log('Role verification passed (multiple)');
          next();
        } else {
          console.log('Role verification failed (multiple)');
          res.status(401).json({ message: "unauthorised" });
        }
      } else {
        console.log('Checking single role:', {
          allowedRole,
          userRole: req.user?.role,
          matches: req.user?.role === allowedRole
        });

        if (req.user?.role === allowedRole) {
          console.log('Role verification passed (single)');
          next();
        } else {
          console.log('Role verification failed (single)');
          res.status(401).json({ message: "unauthorised" });
        }
      }
    } catch (err) {
      console.error('JWT verification error in verifyRole:', err.message);
      res.status(400).json({ message: "invalid token" });
    }
  };

export default verifyRole;