const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/auth.middleware");
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

// Semua route kategori wajib login dulu
router.use(requireAuth);

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
