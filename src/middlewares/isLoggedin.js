import tokenDecode from "../helpers/tokenDec";

export const isLoggedin = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized request" });
  }

  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = tokenDecode(token);
    req.user = decoded.payload;
    next();
  } catch (err) {
    res.status(400).json({ message: "invalid token" });
  }
};
