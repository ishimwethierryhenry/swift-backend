import { User } from "../database/models";
import bcrypt from "bcrypt";
import generateToken from "../helpers/tokenGen";
import userSchema from "../validations/userSchema";
class UserController {
  //signup
  static async createUser(req, res) {
    try {
      const { error } = userSchema.validate(req.body);
      if (error)
        return res
          .status(400)
          .json({ validationError: error.details[0].message });

      const duplicatedEmail = await User.findOne({
        where: { email: req.body.email },
      });
      if (duplicatedEmail) {
        return res.status(409).json({
          message: "User already exists !!!",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("12345678", salt);

      const newUser = await User.create({
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        phone: req.body.phone,
        location: req.body.location,
        pwd: hashedPassword,
        gender: req.body.gender,
        role: "operator",
      });

      return res.status(201).json({
        status: "Success",
        message: "User created successfully !!!",
        user: newUser,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
  //login

  static async login(req, res) {
    try {
      const { email, pwd } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) return res.status(400).json({ message: "user not found" });

      if (await user.checkPassword(pwd)) {
        const payload = {
          user,
        };

        const token = await generateToken(payload, "1d");

        return res.status(200).json({ token, message: "login successful" });
      } else {
        return res.status(400).json({ message: "invalid credentials" });
      }
    } catch (error) {
      return res.status(500).json({ message: "login failed" });
    }
  }
  //single user
  static async getSingleUser(req, res) {
    try {
      const singleUser = await User.findOne(req.params.id);
      if (!singleUser) {
        res.status(404).json({
          status: "fail",
          message: "user not found!!!",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: singleUser,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  //get all users
  static async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      res.status(200).json({
        status: "success",
        allUsers: users,
      });
    } catch (error) {
      res.status(404).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  // get operators by location
  static async getAllOperators(req, res) {
    try {
      const { location } = req.params;
      const locationStr = location.replace("&", " ");
      const users = await User.findAll({
        where: { location: locationStr, role: "operator" },
      });
      res.status(200).json({
        status: "success",
        allUsers: users,
      });
    } catch (error) {
      res.status(404).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  // Update user role
  static async updateUserRole(req, res) {
    try {
      const userId = req.params.userId;
      const newRole = req.body.newRole;
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          status: "fail",
          message: "User not found",
        });
      }

      // Update user role
      user.role = newRole;
      await user.save();

      res.status(200).json({
        status: "success",
        message: "User role updated successfully",
        user: user,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  // Reset password
  static async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        return res.status(404).json({
          status: "fail",
          message: "User not found",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.pwd = hashedPassword;
      await user.save();

      res.status(200).json({
        status: "success",
        message: "Password reset successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        error: error.message,
      });
    }
  }
  // Delete user
  static async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          status: "fail",
          message: "User not found",
        });
      }

      await user.destroy();

      res.status(200).json({
        status: "success",
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        error: error.message,
      });
    }
  }
}

export default UserController;
