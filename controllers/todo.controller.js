const { Op } = require("sequelize");
const { Todo, Category } = require("../models");
const sendResponse = require("../utils/response");

// GET /api/todos -> ambil semua todo milik user dg filter, search, relasi category
async function getTodos(req, res) {
  try {
    const { status, priority, category_id, search, sort } = req.query;

    const whereClause = {
      user_id: req.session.userId,
    };

    // Filter status
    if (status === "completed" || status === "done" || status === "true") {
      whereClause.is_done = true;
    } else if (
      status === "active" ||
      status === "pending" ||
      status === "false"
    ) {
      whereClause.is_done = false;
    }

    // Filter priority
    if (
      priority &&
      ["LOW", "MEDIUM", "HIGH"].includes(priority.toUpperCase())
    ) {
      whereClause.priority = priority.toUpperCase();
    }

    // Filter category
    if (category_id) {
      whereClause.category_id = category_id;
    }

    // Search by title or description
    if (search && search.trim() !== "") {
      whereClause[Op.or] = [
        { title: { [Op.iLike || Op.like]: `%${search.trim()}%` } },
        { description: { [Op.iLike || Op.like]: `%${search.trim()}%` } },
      ];
    }

    // Order sorting
    let orderClause = [["createdAt", "DESC"]];
    if (sort === "due_date_asc") {
      orderClause = [["due_date", "ASC"]];
    } else if (sort === "due_date_desc") {
      orderClause = [["due_date", "DESC"]];
    } else if (sort === "title_asc") {
      orderClause = [["title", "ASC"]];
    } else if (sort === "priority") {
      orderClause = [
        [
          Todo.sequelize.literal(
            `CASE WHEN priority = 'HIGH' THEN 1 WHEN priority = 'MEDIUM' THEN 2 ELSE 3 END`,
          ),
          "ASC",
        ],
      ];
    }

    const todos = await Todo.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "color", "icon"],
        },
      ],
      order: orderClause,
    });

    return sendResponse(res, {
      message: "Berhasil ambil todo",
      data: todos,
    });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// GET /api/todos/stats -> statistik ringkasan todo
async function getTodoStats(req, res) {
  try {
    const userId = req.session.userId;

    const total = await Todo.count({ where: { user_id: userId } });
    const completed = await Todo.count({
      where: { user_id: userId, is_done: true },
    });
    const pending = total - completed;
    const highPriority = await Todo.count({
      where: { user_id: userId, priority: "HIGH", is_done: false },
    });

    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return sendResponse(res, {
      message: "Berhasil ambil statistik todo",
      data: {
        total,
        completed,
        pending,
        highPriority,
        completionRate,
      },
    });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// GET /api/todos/:id -> ambil detail satu todo
async function getTodoById(req, res) {
  try {
    const { id } = req.params;

    const todo = await Todo.findOne({
      where: { id, user_id: req.session.userId },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "color", "icon"],
        },
      ],
    });

    if (!todo) {
      return sendResponse(res, {
        code: 404,
        success: false,
        message: "Todo tidak ditemukan",
      });
    }

    return sendResponse(res, {
      message: "Berhasil ambil detail todo",
      data: todo,
    });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// POST /api/todos -> tambah todo baru
async function addTodo(req, res) {
  try {
    const { title, description, priority, due_date, category_id } = req.body;

    if (!title || title.trim() === "") {
      return sendResponse(res, {
        code: 400,
        success: false,
        message: "title wajib diisi",
      });
    }

    // Validasi kategori jika diberikan
    let validCategoryId = null;
    if (category_id) {
      const cat = await Category.findOne({
        where: { id: category_id, user_id: req.session.userId },
      });
      if (cat) validCategoryId = cat.id;
    }

    const todo = await Todo.create({
      title: title.trim(),
      description: description || null,
      priority: ["LOW", "MEDIUM", "HIGH"].includes(priority?.toUpperCase())
        ? priority.toUpperCase()
        : "MEDIUM",
      due_date: due_date || null,
      category_id: validCategoryId,
      is_done: false,
      user_id: req.session.userId,
    });

    const result = await Todo.findByPk(todo.id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "color", "icon"],
        },
      ],
    });

    return sendResponse(res, {
      code: 201,
      message: "Todo berhasil ditambahkan",
      data: result,
    });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// PUT /api/todos/:id -> update todo
async function updateTodo(req, res) {
  try {
    const { id } = req.params;
    const { title, description, priority, due_date, is_done, category_id } =
      req.body;

    const todo = await Todo.findOne({
      where: { id, user_id: req.session.userId },
    });

    if (!todo) {
      return sendResponse(res, {
        code: 404,
        success: false,
        message: "Todo tidak ditemukan",
      });
    }

    if (title !== undefined) todo.title = title.trim();
    if (description !== undefined) todo.description = description;
    if (
      priority !== undefined &&
      ["LOW", "MEDIUM", "HIGH"].includes(priority.toUpperCase())
    ) {
      todo.priority = priority.toUpperCase();
    }
    if (due_date !== undefined) todo.due_date = due_date || null;
    if (is_done !== undefined) todo.is_done = Boolean(is_done);

    if (category_id !== undefined) {
      if (category_id === null || category_id === "") {
        todo.category_id = null;
      } else {
        const cat = await Category.findOne({
          where: { id: category_id, user_id: req.session.userId },
        });
        if (cat) todo.category_id = cat.id;
      }
    }

    await todo.save();

    const result = await Todo.findByPk(todo.id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "color", "icon"],
        },
      ],
    });

    return sendResponse(res, {
      message: "Todo berhasil diupdate",
      data: result,
    });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// PATCH /api/todos/:id/toggle -> toggle status is_done cepat
async function toggleTodo(req, res) {
  try {
    const { id } = req.params;

    const todo = await Todo.findOne({
      where: { id, user_id: req.session.userId },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "color", "icon"],
        },
      ],
    });

    if (!todo) {
      return sendResponse(res, {
        code: 404,
        success: false,
        message: "Todo tidak ditemukan",
      });
    }

    todo.is_done = !todo.is_done;
    await todo.save();

    return sendResponse(res, {
      message: `Status todo berhasil diubah menjadi ${todo.is_done ? "selesai" : "belum selesai"}`,
      data: todo,
    });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// DELETE /api/todos/:id -> hapus todo
async function deleteTodo(req, res) {
  try {
    const { id } = req.params;

    const todo = await Todo.findOne({
      where: { id, user_id: req.session.userId },
    });

    if (!todo) {
      return sendResponse(res, {
        code: 404,
        success: false,
        message: "Todo tidak ditemukan",
      });
    }

    await todo.destroy();

    return sendResponse(res, { message: "Todo berhasil dihapus" });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

module.exports = {
  getTodos,
  getTodoStats,
  getTodoById,
  addTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
};
