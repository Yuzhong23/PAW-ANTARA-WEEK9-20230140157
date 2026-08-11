const sequelize = require("../config/database");
const User = require("./user.model");
const Category = require("./category.model");
const Todo = require("./todo.model");

module.exports = {
  sequelize,
  User,
  Category,
  Todo,
};
