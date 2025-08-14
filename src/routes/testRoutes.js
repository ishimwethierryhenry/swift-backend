import express from "express";
import { test } from "../controllers/testController";
import { isLoggedin } from "../middlewares/isLoggedin";

const testRoutes = express.Router();

testRoutes.get("/", test);

export default testRoutes;
