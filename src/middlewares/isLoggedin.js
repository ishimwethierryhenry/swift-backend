// src/middlewares/isLoggedin.js - UPDATED VERSION
import tokenDecode from "../helpers/tokenDec";

export const isLoggedin = async (req, res, next) => {
  console.log('Auth Debug - Headers:', {
    hasAuthHeader: !!req.headers.authorization,
    authHeader: req.headers.authorization?.substring(0, 50) + '...'
  });

  if (!req.headers.authorization) {
    console.log('No authorization header found');
    return res.status(401).json({ message: "Unauthorized request" });
  }

  const token = req.headers.authorization.split(" ")[1];
  
  console.log('Token Debug:', {
    tokenExists: !!token,
    tokenLength: token?.length,
    tokenStart: token?.substring(0, 20) + '...'
  });

  if (!token) {
    console.log('No token in authorization header');
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = tokenDecode(token);
    console.log('Token decoded successfully:', {
      userId: decoded.payload?.user?.id || decoded.payload?.id,
      userRole: decoded.payload?.user?.role || decoded.payload?.role,
      userLocation: decoded.payload?.user?.location || decoded.payload?.location
    });
    
    // FIXED: Ensure consistent structure
    if (decoded.payload.user) {
      req.user = decoded.payload.user; // Keep nested structure: { id, role, fname, lname, ... }
    } else {
      req.user = decoded.payload; // Handle flat structure: { id, role, fname, lname, ... }
    }
    
    next();
  } catch (err) {
    console.error('Token decode error:', err.message);
    res.status(400).json({ message: "invalid token" });
  }
};