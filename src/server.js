import * as dotenv from "dotenv";
import express from "express";
import session from "cookie-session";
import cors from "cors";
import router from "./routes";

dotenv.config();
export const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
app.use(cors());
app.use(express.json({}));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.EXPRESS_SESSION,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(router); //all routes
