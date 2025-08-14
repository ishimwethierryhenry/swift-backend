"use strict";

const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Pool, { foreignKey: "assigned_to" });
    }

    async checkPassword(password) {
      const match = await bcrypt.compare(password, this.pwd);
      return match;
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fname: DataTypes.STRING,
      lname: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      location: DataTypes.STRING,
      pwd: DataTypes.STRING,
      role: {
        type: DataTypes.STRING,
        defaultValue: "operator",
      },
      gender: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  User.beforeCreate((user) => {
    user.id = uuidv4();
  });
  return User;
};
