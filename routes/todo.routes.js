const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/auth.middleware");
const {
  getTodos,
  getTodoStats,
  getTodoById,
  addTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
} = require("../controllers/todo.controller");

// Semua route todo wajib login dulu
router.use(requireAuth);

router.get("/stats", getTodoStats);
router.get("/", getTodos);
router.get("/:id", getTodoById);
router.post("/", addTodo);
router.put("/:id", updateTodo);
router.patch("/:id/toggle", toggleTodo);
router.delete("/:id", deleteTodo);

module.exports = router;
