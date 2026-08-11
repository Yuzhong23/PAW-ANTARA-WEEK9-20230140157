require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const { sequelize } = require("./models");

const authRoutes = require("./routes/auth.routes");
const todoRoutes = require("./routes/todo.routes");
const categoryRoutes = require("./routes/category.routes");

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-key-todo-paw-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 hari
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/categories", categoryRoutes);

// Fallback to index.html for SPA frontend or root route
app.get("/api", (req, res) => {
  res.json({
    message: "Todo API with Sequelize ORM & Categories 🚀",
    version: "2.0.0",
    docs: "/README.md",
  });
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("✅ Koneksi database berhasil!");

    // sync model ke db (alter: true untuk update skema kolom tanpa drop data)
    await sequelize.sync({ alter: true });
    console.log("✅ Sync model dan relasi ORM selesai!");

    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
      console.log(`🌐 Akses Web UI di: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Gagal konek ke database:", err.message);
  }
}

// Export app for testing or modular usage
module.exports = { app, start };

if (require.main === module) {
  start();
}
