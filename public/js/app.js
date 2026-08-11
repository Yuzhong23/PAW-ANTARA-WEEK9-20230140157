// State Management
let currentUser = null;
let categories = [];
let todos = [];
let activeCategoryFilter = null;

// DOM Elements
const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const userDisplayName = document.getElementById("user-display-name");

const todoListContainer = document.getElementById("todo-list-container");
const categoryPills = document.getElementById("category-pills");
const todoModal = document.getElementById("todo-modal");
const todoForm = document.getElementById("todo-form");
const categoryModal = document.getElementById("category-modal");
const categoryForm = document.getElementById("category-form");

const searchInput = document.getElementById("search-input");
const filterStatus = document.getElementById("filter-status");
const filterPriority = document.getElementById("filter-priority");
const filterSort = document.getElementById("filter-sort");

// Stats Elements
const statTotal = document.getElementById("stat-total");
const statCompleted = document.getElementById("stat-completed");
const statPending = document.getElementById("stat-pending");
const statHigh = document.getElementById("stat-high");
const statRate = document.getElementById("stat-rate");

// Init application
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  checkAuth();
});

function setupEventListeners() {
  // Tabs
  tabLogin.addEventListener("click", () => switchAuthTab("login"));
  tabRegister.addEventListener("click", () => switchAuthTab("register"));

  // Forms
  loginForm.addEventListener("submit", handleLogin);
  registerForm.addEventListener("submit", handleRegister);
  todoForm.addEventListener("submit", handleSaveTodo);
  categoryForm.addEventListener("submit", handleSaveCategory);

  // Filters & Search
  let debounceTimeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      loadTodos();
    }, 300);
  });

  filterStatus.addEventListener("change", loadTodos);
  filterPriority.addEventListener("change", loadTodos);
  filterSort.addEventListener("change", loadTodos);
}

// Toast Notification
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Quick Fill for Login Demo
function quickFill(user, pass) {
  document.getElementById("login-username").value = user;
  document.getElementById("login-password").value = pass;
  showToast(`Kredensial demo diisi: ${user}`, "info");
}

// Switch Login / Register Tabs
function switchAuthTab(type) {
  if (type === "login") {
    tabLogin.className = "flex-1 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white transition-all shadow";
    tabRegister.className = "flex-1 py-2 text-sm font-semibold rounded-lg text-slate-400 hover:text-slate-200 transition-all";
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  } else {
    tabRegister.className = "flex-1 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white transition-all shadow";
    tabLogin.className = "flex-1 py-2 text-sm font-semibold rounded-lg text-slate-400 hover:text-slate-200 transition-all";
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  }
}

// Check session on load
async function checkAuth() {
  try {
    const res = await fetch("/api/auth/me");
    const json = await res.json();
    if (json.success && json.data) {
      currentUser = json.data;
      showDashboard();
    } else {
      showAuth();
    }
  } catch (err) {
    showAuth();
  }
}

function showAuth() {
  currentUser = null;
  authSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
  lucide.createIcons();
}

function showDashboard() {
  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  userDisplayName.textContent = currentUser.username;
  loadDashboardData();
  lucide.createIcons();
}

// Auth Handlers
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json();

    if (json.success) {
      currentUser = json.data;
      showToast(json.message, "success");
      showDashboard();
    } else {
      showToast(json.message || "Gagal login", "error");
    }
  } catch (err) {
    showToast("Terjadi kesalahan jaringan", "error");
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json();

    if (json.success) {
      showToast("Registrasi berhasil! Silakan login", "success");
      switchAuthTab("login");
      document.getElementById("login-username").value = username;
      document.getElementById("login-password").value = "";
    } else {
      showToast(json.message || "Gagal registrasi", "error");
    }
  } catch (err) {
    showToast("Terjadi kesalahan jaringan", "error");
  }
}

async function logoutUser() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
    showToast("Berhasil logout", "info");
    showAuth();
  } catch (err) {
    showAuth();
  }
}

// Load Dashboard Data
async function loadDashboardData() {
  await Promise.all([loadCategories(), loadTodos(), loadStats()]);
}

// Load Categories
async function loadCategories() {
  try {
    const res = await fetch("/api/categories");
    const json = await res.json();
    if (json.success) {
      categories = json.data || [];
      renderCategoryPills();
      renderCategoryModalList();
      populateCategorySelect();
    }
  } catch (err) {
    console.error("Gagal load kategori", err);
  }
}

// Render Category Filter Pills
function renderCategoryPills() {
  let html = `
    <button onclick="setCategoryFilter(null)" class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
      activeCategoryFilter === null
        ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
        : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
    }">
      Semua Kategori
    </button>
  `;

  categories.forEach((cat) => {
    const isSelected = activeCategoryFilter === cat.id;
    html += `
      <button onclick="setCategoryFilter(${cat.id})" class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
      isSelected
        ? "text-white shadow-md"
        : "bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white"
    }" style="${
      isSelected
        ? `background-color: ${cat.color}; border-color: ${cat.color}`
        : ""
    }">
        <span class="w-2 h-2 rounded-full" style="background-color: ${
          cat.color
        }"></span>
        <span>${cat.name}</span>
        <span class="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800/80 text-slate-400">${
          cat.total_todos || 0
        }</span>
      </button>
    `;
  });

  categoryPills.innerHTML = html;
}

function setCategoryFilter(catId) {
  activeCategoryFilter = catId;
  renderCategoryPills();
  loadTodos();
}

// Populate Category Select in Todo Modal
function populateCategorySelect() {
  const select = document.getElementById("todo-category");
  select.innerHTML = '<option value="">Tanpa Kategori</option>';
  categories.forEach((cat) => {
    select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
  });
}

// Load Statistics
async function loadStats() {
  try {
    const res = await fetch("/api/todos/stats");
    const json = await res.json();
    if (json.success && json.data) {
      statTotal.textContent = json.data.total;
      statCompleted.textContent = json.data.completed;
      statPending.textContent = json.data.pending;
      statHigh.textContent = json.data.highPriority;
      statRate.textContent = `${json.data.completionRate}% selesai`;
    }
  } catch (err) {
    console.error("Gagal load stats", err);
  }
}

// Load Todos with Query Filters
async function loadTodos() {
  try {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.append("search", searchInput.value.trim());
    if (filterStatus.value !== "all") params.append("status", filterStatus.value);
    if (filterPriority.value) params.append("priority", filterPriority.value);
    if (filterSort.value) params.append("sort", filterSort.value);
    if (activeCategoryFilter) params.append("category_id", activeCategoryFilter);

    const res = await fetch(`/api/todos?${params.toString()}`);
    const json = await res.json();

    if (json.success) {
      todos = json.data || [];
      renderTodos();
    }
  } catch (err) {
    console.error("Gagal load todos", err);
  }
}

// Render Todos List
function renderTodos() {
  if (todos.length === 0) {
    todoListContainer.innerHTML = `
      <div class="glass-panel p-12 rounded-3xl text-center border border-slate-800">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 mb-3">
          <i data-lucide="clipboard-list" class="w-6 h-6"></i>
        </div>
        <h4 class="text-base font-semibold text-slate-300">Belum Ada Tugas</h4>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Tidak ditemukan tugas dengan filter saat ini. Klik tombol "Tambah Tugas" untuk membuat tugas baru.
        </p>
        <button onclick="openTodoModal()" class="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          Tambah Tugas Baru
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  let html = "";
  todos.forEach((todo) => {
    const isDone = todo.is_done;
    const priorityColors = {
      HIGH: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      LOW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };

    const categoryBadge = todo.category
      ? `<span class="px-2.5 py-0.5 rounded-lg text-[11px] font-medium border flex items-center gap-1" style="background-color: ${todo.category.color}15; color: ${todo.category.color}; border-color: ${todo.category.color}30">
          <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${todo.category.color}"></span>
          ${todo.category.name}
        </span>`
      : "";

    const dueDateBadge = todo.due_date
      ? `<span class="px-2 py-0.5 rounded-lg text-[11px] text-slate-400 bg-slate-800/80 border border-slate-700/60 flex items-center gap-1">
          <i data-lucide="calendar" class="w-3 h-3 text-slate-500"></i>
          ${todo.due_date}
        </span>`
      : "";

    html += `
      <div class="glass-card p-4 rounded-2xl flex items-start gap-3.5 group transition-all ${
        isDone ? "opacity-75 bg-slate-900/50" : ""
      }">
        <!-- Checkbox Toggle -->
        <button onclick="toggleTodoStatus(${todo.id})" class="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all border ${
      isDone
        ? "bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-500/30"
        : "border-slate-700 hover:border-indigo-500 bg-slate-900/60 text-transparent hover:text-indigo-400"
    }">
          <i data-lucide="check" class="w-3.5 h-3.5 stroke-[3]"></i>
        </button>

        <!-- Main Task Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="text-sm font-semibold text-white ${
              isDone ? "task-completed text-slate-400" : ""
            }">
              ${escapeHtml(todo.title)}
            </h4>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
              priorityColors[todo.priority] || priorityColors.MEDIUM
            }">
              ${todo.priority}
            </span>
            ${categoryBadge}
            ${dueDateBadge}
          </div>

          ${
            todo.description
              ? `<p class="text-xs text-slate-400 mt-1 leading-relaxed ${
                  isDone ? "task-completed text-slate-500" : ""
                }">${escapeHtml(todo.description)}</p>`
              : ""
          }
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button onclick="openEditTodoModal(${todo.id})" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs" title="Edit Tugas">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="deleteTodoItem(${todo.id})" class="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all text-xs" title="Hapus Tugas">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  });

  todoListContainer.innerHTML = html;
  lucide.createIcons();
}

// Toggle Todo Status
async function toggleTodoStatus(id) {
  try {
    const res = await fetch(`/api/todos/${id}/toggle`, { method: "PATCH" });
    const json = await res.json();
    if (json.success) {
      loadTodos();
      loadStats();
      loadCategories(); // refresh counter
      showToast(json.message, "success");
    } else {
      showToast(json.message || "Gagal mengubah status", "error");
    }
  } catch (err) {
    showToast("Terjadi kesalahan", "error");
  }
}

// Delete Todo
async function deleteTodoItem(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus tugas ini?")) return;

  try {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      showToast(json.message, "success");
      loadTodos();
      loadStats();
      loadCategories();
    } else {
      showToast(json.message || "Gagal menghapus", "error");
    }
  } catch (err) {
    showToast("Terjadi kesalahan", "error");
  }
}

// Todo Modal Handlers
function openTodoModal() {
  document.getElementById("todo-modal-title").textContent = "Tambah Tugas Baru";
  document.getElementById("todo-id").value = "";
  document.getElementById("todo-title").value = "";
  document.getElementById("todo-desc").value = "";
  document.getElementById("todo-priority").value = "MEDIUM";
  document.getElementById("todo-due-date").value = "";
  document.getElementById("todo-category").value = activeCategoryFilter || "";

  todoModal.classList.remove("hidden");
  lucide.createIcons();
}

function openEditTodoModal(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  document.getElementById("todo-modal-title").textContent = "Edit Tugas";
  document.getElementById("todo-id").value = todo.id;
  document.getElementById("todo-title").value = todo.title;
  document.getElementById("todo-desc").value = todo.description || "";
  document.getElementById("todo-priority").value = todo.priority || "MEDIUM";
  document.getElementById("todo-due-date").value = todo.due_date || "";
  document.getElementById("todo-category").value = todo.category_id || "";

  todoModal.classList.remove("hidden");
  lucide.createIcons();
}

function closeTodoModal() {
  todoModal.classList.add("hidden");
}

async function handleSaveTodo(e) {
  e.preventDefault();
  const id = document.getElementById("todo-id").value;
  const title = document.getElementById("todo-title").value;
  const description = document.getElementById("todo-desc").value;
  const priority = document.getElementById("todo-priority").value;
  const due_date = document.getElementById("todo-due-date").value || null;
  const category_id = document.getElementById("todo-category").value || null;

  const payload = { title, description, priority, due_date, category_id };
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/todos/${id}` : "/api/todos";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (json.success) {
      showToast(json.message, "success");
      closeTodoModal();
      loadTodos();
      loadStats();
      loadCategories();
    } else {
      showToast(json.message || "Gagal menyimpan tugas", "error");
    }
  } catch (err) {
    showToast("Terjadi kesalahan", "error");
  }
}

// Category Modal Handlers
function openCategoryModal() {
  resetCategoryForm();
  renderCategoryModalList();
  categoryModal.classList.remove("hidden");
  lucide.createIcons();
}

function closeCategoryModal() {
  categoryModal.classList.add("hidden");
}

function resetCategoryForm() {
  document.getElementById("category-id").value = "";
  document.getElementById("category-name").value = "";
  document.getElementById("category-color").value = "#3B82F6";
  document.getElementById("category-form-title").textContent = "Tambah Kategori Baru";
  document.getElementById("btn-submit-cat-text").textContent = "Simpan";
  document.getElementById("btn-cancel-cat-edit").classList.add("hidden");
}

function editCategoryItem(id) {
  const cat = categories.find((c) => c.id === id);
  if (!cat) return;

  document.getElementById("category-id").value = cat.id;
  document.getElementById("category-name").value = cat.name;
  document.getElementById("category-color").value = cat.color;
  document.getElementById("category-form-title").textContent = "Edit Kategori";
  document.getElementById("btn-submit-cat-text").textContent = "Update";
  document.getElementById("btn-cancel-cat-edit").classList.remove("hidden");
}

async function handleSaveCategory(e) {
  e.preventDefault();
  const id = document.getElementById("category-id").value;
  const name = document.getElementById("category-name").value;
  const color = document.getElementById("category-color").value;

  const payload = { name, color };
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/categories/${id}` : "/api/categories";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (json.success) {
      showToast(json.message, "success");
      resetCategoryForm();
      await loadCategories();
      renderCategoryModalList();
    } else {
      showToast(json.message || "Gagal menyimpan kategori", "error");
    }
  } catch (err) {
    showToast("Terjadi kesalahan", "error");
  }
}

async function deleteCategoryItem(id) {
  if (!confirm("Hapus kategori ini? Todo di dalam kategori ini tidak akan terhapus.")) return;

  try {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const json = await res.json();

    if (json.success) {
      showToast(json.message, "success");
      if (activeCategoryFilter === id) activeCategoryFilter = null;
      await loadCategories();
      renderCategoryModalList();
      loadTodos();
    } else {
      showToast(json.message || "Gagal menghapus kategori", "error");
    }
  } catch (err) {
    showToast("Terjadi kesalahan", "error");
  }
}

function renderCategoryModalList() {
  const container = document.getElementById("category-modal-list");
  if (categories.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Belum ada kategori yang dibuat.</p>`;
    return;
  }

  let html = "";
  categories.forEach((cat) => {
    html += `
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
        <div class="flex items-center gap-2.5">
          <span class="w-3.5 h-3.5 rounded-full" style="background-color: ${cat.color}"></span>
          <span class="text-xs font-semibold text-white">${escapeHtml(cat.name)}</span>
          <span class="text-[10px] px-2 py-0.5 bg-slate-800 rounded-full text-slate-400">${cat.total_todos || 0} tugas</span>
        </div>
        <div class="flex items-center gap-1">
          <button onclick="editCategoryItem(${cat.id})" class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 text-xs">
            <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="deleteCategoryItem(${cat.id})" class="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 text-xs">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  lucide.createIcons();
}

// Utility: Escape HTML
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
