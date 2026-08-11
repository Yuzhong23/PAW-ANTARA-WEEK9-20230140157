const { Category, Todo } = require("../models");
const sendResponse = require("../utils/response");

// GET /api/categories -> ambil semua kategori milik user yg login beserta jumlah todo
async function getCategories(req, res) {
  try {
    const categories = await Category.findAll({
      where: { user_id: req.session.userId },
      include: [
        {
          model: Todo,
          attributes: ["id", "is_done"],
        },
      ],
      order: [["name", "ASC"]],
    });

    const formattedCategories = categories.map((cat) => {
      const plain = cat.toJSON();
      const todos = plain.Todos || [];
      return {
        id: plain.id,
        name: plain.name,
        color: plain.color,
        icon: plain.icon,
        user_id: plain.user_id,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
        total_todos: todos.length,
        completed_todos: todos.filter((t) => t.is_done).length,
      };
    });

    return sendResponse(res, {
      message: "Berhasil ambil daftar kategori",
      data: formattedCategories,
    });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// GET /api/categories/:id -> ambil detail kategori
async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    const category = await Category.findOne({
      where: { id, user_id: req.session.userId },
      include: [
        {
          model: Todo,
        },
      ],
    });

    if (!category) {
      return sendResponse(res, {
        code: 404,
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    return sendResponse(res, {
      message: "Berhasil ambil detail kategori",
      data: category,
    });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// POST /api/categories -> tambah kategori baru
async function createCategory(req, res) {
  try {
    const { name, color, icon } = req.body;

    if (!name) {
      return sendResponse(res, {
        code: 400,
        success: false,
        message: "Nama kategori wajib diisi",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      color: color || "#3B82F6",
      icon: icon || "folder",
      user_id: req.session.userId,
    });

    return sendResponse(res, {
      code: 201,
      message: "Kategori berhasil ditambahkan",
      data: category,
    });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// PUT /api/categories/:id -> update kategori
async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    const category = await Category.findOne({
      where: { id, user_id: req.session.userId },
    });

    if (!category) {
      return sendResponse(res, {
        code: 404,
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    if (name !== undefined) category.name = name.trim();
    if (color !== undefined) category.color = color;
    if (icon !== undefined) category.icon = icon;

    await category.save();

    return sendResponse(res, {
      message: "Kategori berhasil diupdate",
      data: category,
    });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// DELETE /api/categories/:id -> hapus kategori
async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id, user_id: req.session.userId },
    });

    if (!category) {
      return sendResponse(res, {
        code: 404,
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    await category.destroy();

    return sendResponse(res, {
      message: "Kategori berhasil dihapus",
    });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
