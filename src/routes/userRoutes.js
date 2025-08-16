// src/routes/userRoutes.js
import express from "express";
import UserController from "../controllers/userController";
import { isLoggedin } from "../middlewares/isLoggedin";
import verifyRole from "../middlewares/verifyRole";

const userRoutes = express.Router();

// Public routes
userRoutes.post("/signup", UserController.createUser);
userRoutes.post("/login", UserController.login);
userRoutes.put("/reset", UserController.resetPassword);

// Admin only routes
userRoutes.get(
  "/user/:id",
  isLoggedin,
  verifyRole("admin"),
  UserController.getSingleUser
);

userRoutes.get(
  "/users",
  isLoggedin,
  verifyRole("admin"),
  UserController.getAllUsers
);

userRoutes.get(
  "/operators/:location",
  isLoggedin,
  verifyRole("admin"),
  UserController.getAllOperators
);

userRoutes.get(
  "/guests/:location",
  isLoggedin,
  verifyRole("admin"),
  UserController.getAllGuests
);

userRoutes.put(
  "/update/:userId",
  isLoggedin,
  verifyRole("admin"),
  UserController.updateUserRole
);

userRoutes.delete(
  "/delete/:id",
  isLoggedin,
  verifyRole("admin"),
  UserController.deleteUser
);

export default userRoutes;