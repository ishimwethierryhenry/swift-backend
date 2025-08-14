import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const generateToken = async (payload, expires = "7d") => {
  const token = jwt.sign({ payload }, process.env.JWT_SECRET, {
    expiresIn: expires,
  });
  return token;
};

export default generateToken;
