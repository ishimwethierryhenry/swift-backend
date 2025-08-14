import jwt from "jsonwebtoken";

export const verifyRole =
  (allowedRole, multiple = false) =>
  (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized request" });
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.payload.user;
      if (multiple) {
        const allowedRoles = allowedRole.split(",");

        if (allowedRoles.includes(req.user?.role)) {
          next();
        } else {
          res.status(401).json({ message: "unauthorised" });
        }
      } else {
        if (req.user?.role === allowedRole) {
          next();
        } else {
          res.status(401).json({ message: "unauthorised" });
        }
      }
    } catch (err) {
      res.status(400).json({ message: "invalid token" });
    }
  };

export default verifyRole;
