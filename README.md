# TaskMaster - Todo & Category Management API with ORM (Express + Sequelize + PostgreSQL)

Aplikasi manajemen Todo dan Kategori dengan arsitektur MVC (Model-View-Controller), ORM Sequelize, autentikasi session, dan antarmuka web modern berbasis Tailwind CSS.

---

## 🌟 Fitur Utama
1. **Autentikasi Pengguna**: Register, Login, Logout, dan Session Verifier (`/api/auth/me`) dengan enkripsi password `bcrypt` dan `express-session`.
2. **Manajemen Kategori (Model Baru)**:
   - CRUD Kategori dengan kustomisasi warna dan ikon.
   - Relasi 1-to-N (*One-to-Many*) antara User dan Kategori.
   - Relasi 1-to-N (*One-to-Many*) antara Kategori dan Todo (*Foreign Key* `category_id`).
3. **Manajemen Todo Lengkap**:
   - CRUD Todo (Create, Read, Update, Delete).
   - Atribut lengkap: `title`, `description`, `priority` (`LOW`, `MEDIUM`, `HIGH`), `due_date`, `is_done`, dan relasi `category_id`.
   - Toggle status selesai cepat (`PATCH /api/todos/:id/toggle`).
   - Pencarian real-time (*search by title/description*).
   - Filter berdasarkan status (`all`, `pending`, `completed`), prioritas, dan kategori.
   - Pengurutan (*sorting*) berdasarkan tanggal dibuat, jatuh tempo, prioritas, atau abjad judul.
   - Statistik agregat tugas (`GET /api/todos/stats`).
4. **Antarmuka Web Modern (Frontend SPA)**:
   - Dibangun dengan **HTML5**, **Tailwind CSS**, dan **Vanilla JS**.
   - Glassmorphism dark mode UI yang responsif.
   - Dashboard statistik, filter pills kategori, modal pop-up CRUD, dan toast notification interaktif.

---

## 📁 Struktur Folder Proyek
```
PAW-ANTARA-WEEK9/
├── app.js                      # Entry point Express & DB sync
├── config/
│   └── database.js             # Konfigurasi koneksi Sequelize PostgreSQL
├── controllers/
│   ├── auth.controller.js      # Handler registrasi, login, session, logout
│   ├── category.controller.js  # CRUD Category dengan ORM Sequelize
│   └── todo.controller.js      # CRUD Todo, filter, search, statistik
├── middlewares/
│   └── auth.middleware.js      # Proteksi session login
├── models/
│   ├── index.js                # Definisi relasi antar-model ORM
│   ├── user.model.js           # Model User (id, username, password)
│   ├── category.model.js       # Model Category (id, name, color, icon, user_id)
│   └── todo.model.js           # Model Todo (id, title, desc, priority, due_date, is_done, user_id, category_id)
├── public/                     # Frontend Web Client
│   ├── css/
│   │   └── style.css           # Styling custom & animasi
│   ├── js/
│   │   └── app.js              # State management & interaksi API
│   └── index.html              # Halaman web dashboard responsif
├── routes/
│   ├── auth.routes.js          # Rute autentikasi (/api/auth)
│   ├── category.routes.js      # Rute kategori (/api/categories)
│   └── todo.routes.js          # Rute todo (/api/todos)
├── seeders/
│   └── seed.js                 # Seeder data awal User, Kategori, & Todo
├── utils/
│   └── response.js             # Standarisasi format response JSON API
├── package.json
└── README.md
```

---

## 🚀 Cara Instalasi & Menjalankan

### 1. Buat Database PostgreSQL
Buka terminal PostgreSQL / pgAdmin:
```sql
CREATE DATABASE todo_db;
```

### 2. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env`, lalu sesuaikan kredensial:
```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_db
DB_USER=postgres
DB_PASS=postgres

SESSION_SECRET=super-secret-key-todo-paw-2026
```

### 3. Install Dependensi
```bash
npm install
```

### 4. Isi Database Dummy (Seeder)
```bash
npm run seed
```
Data dummy yang dibuat:
- **User 1**: `username: rizki` | `password: password123`
- **User 2**: `username: budi` | `password: password123`
- Beberapa kategori dan todo untuk testing.

### 5. Jalankan Server
```bash
npm run dev
```
Buka browser dan akses **`http://localhost:3000`** untuk membuka antarmuka web.

---

## 📡 Dokumentasi Endpoint API

### 🔑 1. Auth Endpoint (`/api/auth`)
| Method | Endpoint | Body | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{ "username": "...", "password": "..." }` | Pendaftaran akun baru |
| `POST` | `/api/auth/login` | `{ "username": "...", "password": "..." }` | Login & set session cookie |
| `GET` | `/api/auth/me` | - | Cek data session user aktif |
| `POST` | `/api/auth/logout` | - | Hapus session & logout |

### 🏷️ 2. Category Endpoint (`/api/categories`) *(Wajib Login)*
| Method | Endpoint | Body / Query | Deskripsi |
|---|---|---|---|
| `GET` | `/api/categories` | - | Ambil semua kategori user + jumlah todo |
| `GET` | `/api/categories/:id` | - | Detail kategori beserta relasi todo |
| `POST` | `/api/categories` | `{ "name": "...", "color": "#3B82F6", "icon": "folder" }` | Tambah kategori baru |
| `PUT` | `/api/categories/:id` | `{ "name": "...", "color": "..." }` | Update nama / warna kategori |
| `DELETE` | `/api/categories/:id`| - | Hapus kategori (relasi todo menjadi null) |

### 📋 3. Todo Endpoint (`/api/todos`) *(Wajib Login)*
| Method | Endpoint | Parameter / Body | Deskripsi |
|---|---|---|---|
| `GET` | `/api/todos` | `?search=...&status=pending&priority=HIGH&category_id=1&sort=due_date_asc` | Ambil daftar todo dengan filter |
| `GET` | `/api/todos/stats` | - | Statistik ringkasan tugas |
| `GET` | `/api/todos/:id` | - | Detail satu tugas |
| `POST` | `/api/todos` | `{ "title": "...", "description": "...", "priority": "HIGH", "due_date": "2026-08-16", "category_id": 1 }` | Tambah tugas baru |
| `PUT` | `/api/todos/:id` | `{ "title": "...", "description": "...", "priority": "...", "is_done": true, "due_date": "..." }` | Update tugas |
| `PATCH`| `/api/todos/:id/toggle` | - | Toggle status selesai/belum selesai |
| `DELETE`| `/api/todos/:id` | - | Hapus tugas |

---

## 📊 Format Response Standar
```json
{
  "code": 200,
  "success": true,
  "message": "Operasi berhasil",
  "data": { ... }
}
```

---
**Pengembang**: Mahasiswa PAW 2026 &bull; NIM 20230140157
