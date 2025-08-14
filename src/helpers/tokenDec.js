import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const tokenDecode = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
};

export default tokenDecode;