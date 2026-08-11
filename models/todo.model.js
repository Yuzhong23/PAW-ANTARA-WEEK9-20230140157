const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user.model");
const Category = require("./category.model");

const Todo = sequelize.define(
  "Todo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
      defaultValue: "MEDIUM",
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    is_done: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "todos",
    timestamps: true,
  },
);

// Relasi User & Todo
User.hasMany(Todo, { foreignKey: "user_id", onDelete: "CASCADE" });
Todo.belongsTo(User, { foreignKey: "user_id" });

// Relasi User & Category
User.hasMany(Category, { foreignKey: "user_id", onDelete: "CASCADE" });
Category.belongsTo(User, { foreignKey: "user_id" });

// Relasi Category & Todo
Category.hasMany(Todo, { foreignKey: "category_id", onDelete: "SET NULL" });
Todo.belongsTo(Category, { as: "category", foreignKey: "category_id" });

module.exports = Todo;
