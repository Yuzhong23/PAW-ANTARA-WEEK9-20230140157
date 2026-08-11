require("dotenv").config();
const bcrypt = require("bcrypt");
const { sequelize, User, Category, Todo } = require("../models");

const SALT_ROUNDS = 10;

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Koneksi database berhasil");

    // pastiin tabel & kolom udah tersinkronisasi
    await sequelize.sync({ alter: true });

    // password plain buat dummy user: "password123"
    const hashedPassword = await bcrypt.hash("password123", SALT_ROUNDS);

    // 1. Buat User dummy
    const [user1] = await User.findOrCreate({
      where: { username: "rizki" },
      defaults: { password: hashedPassword },
    });

    const [user2] = await User.findOrCreate({
      where: { username: "budi" },
      defaults: { password: hashedPassword },
    });

    console.log("User dummy siap:", user1.username, "&", user2.username);

    // 2. Buat Kategori dummy untuk user1 (rizki)
    const [catKuliah] = await Category.findOrCreate({
      where: { name: "Kuliah & Tugas", user_id: user1.id },
      defaults: { color: "#3B82F6", icon: "book-open" },
    });

    const [catKerja] = await Category.findOrCreate({
      where: { name: "Pekerjaan / Proyek", user_id: user1.id },
      defaults: { color: "#10B981", icon: "briefcase" },
    });

    const [catPribadi] = await Category.findOrCreate({
      where: { name: "Pribadi & Kesehatan", user_id: user1.id },
      defaults: { color: "#F59E0B", icon: "heart" },
    });

    // Kategori untuk user2 (budi)
    const [catUmum] = await Category.findOrCreate({
      where: { name: "Aktivitas Harian", user_id: user2.id },
      defaults: { color: "#8B5CF6", icon: "sun" },
    });

    console.log("Kategori dummy berhasil dibuat");

    // 3. Buat Todo dummy jika belum ada
    const existingTodos = await Todo.count({ where: { user_id: user1.id } });

    if (existingTodos === 0) {
      await Todo.bulkCreate([
        {
          title: "Selesaikan Tugas CRUD ORM Week 9",
          description:
            "Implementasikan model Category, Todo, dan relasi Sequelize serta Web UI Tailwind.",
          priority: "HIGH",
          due_date: "2026-08-16",
          is_done: true,
          user_id: user1.id,
          category_id: catKuliah.id,
        },
        {
          title: "Mempelajari Dokumentasi Sequelize Associations",
          description:
            "Pahami hasMany, belongsTo, dan cascade behavior pada PostgreSQL.",
          priority: "MEDIUM",
          due_date: "2026-08-14",
          is_done: true,
          user_id: user1.id,
          category_id: catKuliah.id,
        },
        {
          title: "Review PR fitur Category Management",
          description:
            "Cek apakah validasi input sudah sesuai dan response konsisten.",
          priority: "MEDIUM",
          due_date: "2026-08-15",
          is_done: false,
          user_id: user1.id,
          category_id: catKerja.id,
        },
        {
          title: "Olahraga lari sore & minum air mineral 2 liter",
          description: "Jaga kebugaran tubuh setelah coding seharian.",
          priority: "LOW",
          due_date: "2026-08-12",
          is_done: false,
          user_id: user1.id,
          category_id: catPribadi.id,
        },
        {
          title: "Deploy Todo App ke server VPS / Render",
          description: "Setup environment variables dan koneksi database cloud.",
          priority: "HIGH",
          due_date: "2026-08-18",
          is_done: false,
          user_id: user1.id,
          category_id: catKerja.id,
        },
        // Todo untuk user2 (budi)
        {
          title: "Belajar Express Session dan Cookies",
          description:
            "Mengerti cara kerja session ID di header Cookie & Express Session.",
          priority: "MEDIUM",
          due_date: "2026-08-13",
          is_done: false,
          user_id: user2.id,
          category_id: catUmum.id,
        },
      ]);
      console.log("Todo dummy berhasil ditambahkan");
    } else {
      console.log("Todo dummy sudah ada, skip penambahan");
    }

    console.log("\nSeeding database selesai ✅");
    console.log("-----------------------------------------");
    console.log("Kredensial Login Testing:");
    console.log("  1) username: rizki  | password: password123");
    console.log("  2) username: budi   | password: password123");
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (err) {
    console.error("Gagal seeding:", err.message);
    process.exit(1);
  }
}

seed();
