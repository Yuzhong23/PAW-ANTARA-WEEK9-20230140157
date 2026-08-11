const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user.model");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: "#3B82F6", // default blue
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: "folder",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "categories",
    timestamps: true,
  },
);

module.exports = Category;
