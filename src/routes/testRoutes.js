// src/routes/testRoutes.js

import express from "express";
import { test, startRecording, stopRecording, saveTestData } from "../controllers/testController.js";
import { isLoggedin } from "../middlewares/isLoggedin.js";

const testRoutes = express.Router();

testRoutes.get("/", test);
testRoutes.post("/start-recording", isLoggedin, startRecording);
testRoutes.post("/stop-recording", isLoggedin, stopRecording);
testRoutes.post("/save-data", isLoggedin, saveTestData);

export default testRoutes;