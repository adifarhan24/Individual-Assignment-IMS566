// ==========================================================
// GLOBAL HELPERS + DATA
// ==========================================================
function $(id) { return document.getElementById(id); }

function safeInit(fn) {
  try { fn(); } catch (err) { console.warn(`Init failed: ${fn.name}`, err); }
}

function getStudents() {
  return JSON.parse(localStorage.getItem("edu_users") || "[]").map(u => ({
    ...u,
    course: u.course || "Unassigned",
    status: u.status || "Active"
  }));
}

function saveStudents(students) {
  localStorage.setItem("edu_users", JSON.stringify(students));
}

function showAlert(msg, type = "success") {
  const alertBox = $("alert");
  if (alertBox) {
    alertBox.textContent = msg;
    alertBox.className = type === "success" ? "text-success" : "text-danger";
  }
}

// =====================================
// DARK MODE (GLOBAL, BOOTSTRAP 5.3 STYLE)
// =====================================
function initDarkMode() {
  const toggle = document.getElementById("darkToggle");
  const icon   = document.getElementById("darkIcon");

  // 1. Baca tema dari localStorage atau default "light"
  const saved = localStorage.getItem("edu_theme") || "light";

  // 2. Apply tema ke <html> / <body>
  applyTheme(saved);

  // 3. Set state butang ikut tema semasa
  if (toggle) {
    toggle.classList.toggle("btn-dark", saved === "dark");
    toggle.classList.toggle("btn-light", saved === "light");
  }
  if (icon) {
    icon.className = saved === "dark" ? "bi bi-sun" : "bi bi-moon";
  }

  // 4. Event klik untuk tukar tema
  if (toggle) {
    toggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-bs-theme") || "light";
      const next = current === "dark" ? "light" : "dark";

      applyTheme(next);
      localStorage.setItem("edu_theme", next);

      if (icon) {
        icon.className = next === "dark" ? "bi bi-sun" : "bi bi-moon";
      }
      toggle.classList.toggle("btn-light");
      toggle.classList.toggle("btn-dark");
    });
  }

  // helper: apply tema
  function applyTheme(mode) {
    // Jika ikut gaya Bootstrap 5.3: guna data-bs-theme pada <html>
    document.documentElement.setAttribute("data-bs-theme", mode);

    // Optional: juga tukar class pada body kalau CSS custom anda guna .dark-mode
    if (mode === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }
}


// ==========================================================
// LOGIN
// ==========================================================
function initLogin() {
  const form = $("loginForm");
  if (!form) return;

  const DEMO_EMAIL = "admin@gmail.com";
  const DEMO_PASSWORD = "password123";
  const emailInput = $("email");
  const passwordInput = $("password");
  const alertBox = $("alert");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) return showError("Please enter both email and password.");
    if (!emailInput.checkValidity()) return showError("Please enter a valid email address.");

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      showSuccess("Login successful! Redirecting...");
      setTimeout(() => { window.location.href = "dashboard.html"; }, 1000);
    } else {
      showError("Invalid email or password.");
    }
  });

  function showError(msg) {
    if (alertBox) { alertBox.textContent = msg; alertBox.className = "text-danger"; }
  }
  function showSuccess(msg) {
    if (alertBox) { alertBox.textContent = msg; alertBox.className = "text-success"; }
  }
}

// ==========================================================
// REGISTER
// ==========================================================
function initRegister() {
  const form = $("registerForm");
  if (!form) return;

  const nameInput = $("name");
  const emailInput = $("email");
  const passwordInput = $("password");
  const confirmPasswordInput = $("confirmPassword");
  const alertBox = $("alert");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!name || !email || !password || !confirmPassword) return showError("Please fill in all fields.");
    if (name.length < 3) return showError("Full name must be at least 3 characters.");
    if (!emailInput.checkValidity()) return showError("Please enter a valid email address.");
    if (password.length < 6) return showError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return showError("Passwords do not match.");

    const users = getStudents();
    users.push({ id: Date.now(), name, email, password, status: "Active", course: "Unassigned" });
    saveStudents(users);

    if (alertBox) {
      alertBox.textContent = "Account created successfully! Redirecting to login...";
      alertBox.className = "text-success";
    }
    setTimeout(() => { window.location.href = "login.html"; }, 1200);
  });

  function showError(msg) {
    if (alertBox) { alertBox.textContent = msg; alertBox.className = "text-danger"; }
  }
}

// ==========================================================
// DASHBOARD
// ==========================================================
function initDashboard() {
  const students = getStudents();
  if (!students) return;

  const totalStudentsEl = $("totalStudents");
  const activeStudentsEl = $("activeStudents");
  const inactiveStudentsEl = $("inactiveStudents");

  const total = students.length;
  const active = students.filter(s => s.status === "Active").length;
  const inactive = total - active;

  if (totalStudentsEl) totalStudentsEl.textContent = total;
  if (activeStudentsEl) activeStudentsEl.textContent = active;
  if (inactiveStudentsEl) inactiveStudentsEl.textContent = inactive;

  const courseStatsContainer = $("courseStats");
  if (courseStatsContainer) {
    const courseCounts = {};
    students.forEach(s => { courseCounts[s.course] = (courseCounts[s.course] || 0) + 1; });
    courseStatsContainer.innerHTML = "";
    Object.keys(courseCounts).forEach(course => {
      const col = document.createElement("div");
      col.className = "col-md-3";
      col.innerHTML = `
        <div class="stat-card shadow-sm p-3 d-flex flex-column">
          <h6 class="mb-1">${course}</h6>
          <p class="mb-0 text-muted">Enrolled students</p>
          <h3 class="mt-2">${courseCounts[course]}</h3>
        </div>`;
      courseStatsContainer.appendChild(col);
    });
  }

  const activityContainer = $("activityList");
  if (activityContainer) {
    const activities = [
      "New student registered for Computer Science.",
      "Attendance marked for Class 10A.",
      "Course 'Data Structures' updated.",
      "Report exported for November.",
      "Teacher John Doe added new assignment."
    ];
    if (activities.length) {
      const list = document.createElement("ul");
      list.className = "list-unstyled mb-0";
      activities.forEach(item => {
        const li = document.createElement("li");
        li.className = "d-flex align-items-start mb-2";
        li.innerHTML = `<i class="bi bi-circle-fill text-success me-2 small"></i><span>${item}</span>`;
        list.appendChild(li);
      });
      activityContainer.innerHTML = "";
      activityContainer.appendChild(list);
    }
  }

  // Charts
  const enrolCanvas = document.getElementById("enrolmentChart");
  if (enrolCanvas && window.Chart) {
    const enrolCtx = enrolCanvas.getContext("2d");
    new Chart(enrolCtx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
        datasets: [{
          label: "Enrolments",
          data: [12, 18, 20, 16, 22, 27, 30, 32],
          borderColor: "rgba(13, 110, 253, 1)",
          backgroundColor: "rgba(13, 110, 253, 0.15)",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 5 }
          }
        }
      }
    });
  }

  const perfCanvas = document.getElementById("performanceChart");
  if (perfCanvas && window.Chart) {
    const perfCtx = perfCanvas.getContext("2d");
    new Chart(perfCtx, {
      type: "bar",
      data: {
        labels: ["Math", "Science", "English", "History", "IT"],
        datasets: [{
          label: "Average Score",
          data: [82, 76, 88, 79, 91],
          backgroundColor: [
            "rgba(13, 110, 253, 0.7)",
            "rgba(25, 135, 84, 0.7)",
            "rgba(255, 193, 7, 0.7)",
            "rgba(13, 202, 240, 0.7)",
            "rgba(220, 53, 69, 0.7)"
          ],
          borderColor: "rgba(0, 0, 0, 0.05)",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 10 }
          }
        }
      }
    });
  }

  // Quick actions
  const qaAddStudent = document.getElementById("qaAddStudent");
  const qaAddCourse = document.getElementById("qaAddCourse");
  const qaManageAttendance = document.getElementById("qaManageAttendance");
  const qaExportReport = document.getElementById("qaExportReport");

  if (qaAddStudent) {
    qaAddStudent.addEventListener("click", () => {
      window.location.href = "student.html";
    });
  }

  if (qaAddCourse) {
    qaAddCourse.addEventListener("click", () => {
      window.location.href = "courses.html";
    });
  }

  if (qaManageAttendance) {
    qaManageAttendance.addEventListener("click", () => {
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem("edu_att_lastDate", today);
      window.location.href = "attendance.html";
    });
  }

  if (qaExportReport) {
    qaExportReport.addEventListener("click", () => {
      const data = {
        exportedAt: new Date().toISOString(),
        totalStudents: total,
        activeStudents: active,
        inactiveStudents: inactive
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "educentre-report.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("Dashboard report exported (JSON demo).");
    });
  }
}

// ==========================================================
// ATTENDANCE
// ==========================================================
function initAttendance() {
  const attDate = $("attDate");
  const attClass = $("attClass");
  const attSearch = $("attSearch");
  const resetFilters = $("resetFilters");
  const attendanceTable = $("attendanceTable");
  if (!attendanceTable) return;

  const attendanceStats = $("attendanceStats");
  const markAllPresent = $("markAllPresent");
  const markAllAbsent = $("markAllAbsent");
  const saveAttendance = $("saveAttendance");
  const lastSavedText = $("lastSavedText");
  const perfectAlert = $("perfectAlert");

  const students = getStudents();
  let currentStatuses = {};

  function getAttendanceStore() {
    const raw = localStorage.getItem("edu_attendance");
    return raw ? JSON.parse(raw) : {};
  }

  function saveAttendanceStore(store) {
    localStorage.setItem("edu_attendance", JSON.stringify(store));
  }

  function makeKey(date, course) {
    return `${date}::${course || "All"}`;
  }

  function getAttendanceHistory() {
    const raw = localStorage.getItem("edu_attendance_history");
    return raw ? JSON.parse(raw) : {};
  }

  function saveAttendanceHistory(history) {
    localStorage.setItem("edu_attendance_history", JSON.stringify(history));
  }

  if (attDate) {
    const today = new Date().toISOString().split("T")[0];
    attDate.value = today;
  }

  if (attClass) {
    const courseSet = new Set(students.map((s) => s.course));
    attClass.innerHTML = '<option value="">All Classes</option>';
    courseSet.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      attClass.appendChild(opt);
    });
  }

  function getFilteredStudents() {
    const selectedCourse = attClass?.value || "";
    const searchText = (attSearch?.value || "").toLowerCase().trim();
    return students.filter((s) => {
      const matchesCourse = !selectedCourse || s.course === selectedCourse;
      const matchesSearch =
        !searchText ||
        s.name.toLowerCase().includes(searchText) ||
        s.email.toLowerCase().includes(searchText);
      return matchesCourse && matchesSearch;
    });
  }

  function loadStatusesForFilter() {
    const date = attDate?.value || "";
    const selectedCourse = attClass?.value || "";
    const key = makeKey(date, selectedCourse);
    const store = getAttendanceStore();
    currentStatuses = store[key] || {};
  }

  function saveCurrentStatuses() {
    const date = attDate?.value || "";
    const selectedCourse = attClass?.value || "";
    if (!date) return;

    const key = makeKey(date, selectedCourse);
    const store = getAttendanceStore();
    store[key] = currentStatuses;
    saveAttendanceStore(store);

    const filtered = getFilteredStudents();
    const total = filtered.length;
    let present = 0, late = 0;
    filtered.forEach((s) => {
      const st = currentStatuses[s.id] || "Absent";
      if (st === "Present") present++;
      else if (st === "Late") late++;
    });
    const todaySummary = {
      date,
      classFilter: selectedCourse || "All",
      total,
      present,
      late,
      absent: total - present - late
    };
    localStorage.setItem("edu_att_today", JSON.stringify(todaySummary));

    const history = getAttendanceHistory();
    filtered.forEach((s) => {
      const st = currentStatuses[s.id] || "Absent";
      if (!history[s.id]) history[s.id] = { present: 0, late: 0, absent: 0 };
      if (st === "Present") history[s.id].present++;
      else if (st === "Late") history[s.id].late++;
      else history[s.id].absent++;
    });
    saveAttendanceHistory(history);

    if (lastSavedText) {
      const now = new Date().toLocaleString();
      lastSavedText.textContent = `Last saved: ${now}`;
    }
  }

  function renderTable() {
    const filtered = getFilteredStudents();
    attendanceTable.innerHTML = "";
    if (!filtered.length) {
      attendanceTable.innerHTML =
        '<tr><td colspan="6" class="text-center text-muted">No students found.</td></tr>';
      return;
    }

    filtered.forEach((student, index) => {
      const row = document.createElement("tr");
      const status = currentStatuses[student.id] || "Absent";

      row.classList.remove("att-present", "att-late", "att-absent");
      if (status === "Present") row.classList.add("att-present");
      else if (status === "Late") row.classList.add("att-late");
      else row.classList.add("att-absent");

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.course}</td>
        <td>
          <span class="badge ${
            status === "Present"
              ? "bg-success-subtle text-success"
              : status === "Late"
              ? "bg-warning-subtle text-warning"
              : "bg-danger-subtle text-danger"
          } px-3 py-2 rounded-pill fw-semibold">${status}</span>
        </td>
        <td>
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-outline-success btn-present" title="Mark Present">P</button>
            <button class="btn btn-outline-warning btn-late" title="Mark Late">L</button>
            <button class="btn btn-outline-danger btn-absent" title="Mark Absent">A</button>
          </div>
        </td>
      `;

      const btnPresent = row.querySelector(".btn-present");
      const btnLate = row.querySelector(".btn-late");
      const btnAbsent = row.querySelector(".btn-absent");

      btnPresent.addEventListener("click", () => {
        currentStatuses[student.id] = "Present";
        renderTable();
        renderStats();
      });
      btnLate.addEventListener("click", () => {
        currentStatuses[student.id] = "Late";
        renderTable();
        renderStats();
      });
      btnAbsent.addEventListener("click", () => {
        currentStatuses[student.id] = "Absent";
        renderTable();
        renderStats();
      });

      attendanceTable.appendChild(row);
    });
  }

  function renderStats() {
    if (!attendanceStats) return;
    const filtered = getFilteredStudents();
    const total = filtered.length;
    let present = 0, late = 0, absent = 0;
    filtered.forEach((s) => {
      const st = currentStatuses[s.id] || "Absent";
      if (st === "Present") present++;
      else if (st === "Late") late++;
      else absent++;
    });

    const history = getAttendanceHistory();
    let monthTotal = 0;
    let monthPresent = 0;
    Object.keys(history).forEach(id => {
      const h = history[id];
      const subtotal = (h.present || 0) + (h.late || 0) + (h.absent || 0);
      monthTotal += subtotal;
      monthPresent += (h.present || 0);
    });
    const monthRate = monthTotal ? Math.round((monthPresent / monthTotal) * 100) : 0;

    attendanceStats.innerHTML = `
      <div class="col-md-3">
        <div class="stat-card shadow-sm p-3 d-flex align-items-center gap-3">
          <div class="stat-icon bg-primary p-3 rounded text-white">
            <i class="bi bi-people-fill fs-4"></i>
          </div>
          <div>
            <h6>Total Students</h6>
            <h3>${total}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card shadow-sm p-3 d-flex align-items-center gap-3">
          <div class="stat-icon bg-success p-3 rounded text-white">
            <i class="bi bi-check-circle-fill fs-4"></i>
          </div>
          <div>
            <h6>Present</h6>
            <h3>${present}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card shadow-sm p-3 d-flex align-items-center gap-3">
          <div class="stat-icon bg-warning p-3 rounded text-white">
            <i class="bi bi-clock-fill fs-4"></i>
          </div>
          <div>
            <h6>Late</h6>
            <h3>${late}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card shadow-sm p-3 d-flex align-items-center gap-3">
          <div class="stat-icon bg-danger p-3 rounded text-white">
            <i class="bi bi-x-circle-fill fs-4"></i>
          </div>
          <div>
            <h6>Absent</h6>
            <h3>${absent}</h3>
          </div>
        </div>
      </div>
      <div class="col-12 mt-2 d-flex justify-content-between flex-wrap gap-2">
        <small class="text-muted">
          Month attendance rate (all students): <strong>${monthRate}%</strong>
        </small>
        <small class="text-muted">
          Filter: <strong>${attClass?.value || "All classes"}</strong> on <strong>${attDate?.value || "-"}</strong>
        </small>
      </div>
    `;

    if (perfectAlert) {
      const allPresent = total > 0 && present === total && late === 0 && absent === 0;
      perfectAlert.classList.toggle("d-none", !allPresent);
    }
  }

  function refreshView() {
    loadStatusesForFilter();
    renderTable();
    renderStats();
  }

  if (attDate) attDate.addEventListener("change", refreshView);
  if (attClass) attClass.addEventListener("change", refreshView);
  if (attSearch) attSearch.addEventListener("input", refreshView);

  if (resetFilters) {
    resetFilters.addEventListener("click", () => {
      if (attDate) attDate.value = new Date().toISOString().split("T")[0];
      if (attClass) attClass.value = "";
      if (attSearch) attSearch.value = "";
      refreshView();
    });
  }

  if (markAllPresent) {
    markAllPresent.addEventListener("click", () => {
      const filtered = getFilteredStudents();
      filtered.forEach((s) => { currentStatuses[s.id] = "Present"; });
      renderTable();
      renderStats();
    });
  }

  if (markAllAbsent) {
    markAllAbsent.addEventListener("click", () => {
      const filtered = getFilteredStudents();
      filtered.forEach((s) => { currentStatuses[s.id] = "Absent"; });
      renderTable();
      renderStats();
    });
  }

  if (saveAttendance) {
    saveAttendance.addEventListener("click", () => {
      saveCurrentStatuses();
      alert("Attendance saved.");
    });
  }

  refreshView();
}

// ==========================================================
// SETTINGS
// ==========================================================
function initSettings() {
  const accountForm = $("accountForm");
  if (!accountForm) return;

  const dom = {
    fullNameInput: $("fullname"),
    emailInput: $("email"),
    passwordInput: $("password"),
    themeModeSelect: $("themeMode"),
    themeColorSelect: $("themeColor"),
    applyThemeBtn: $("applyTheme"),
    emailNotif: $("emailNotif"),
    systemAlert: $("systemAlert"),
    courseAlert: $("courseAlert"),
    saveNotifBtn: $("saveNotif")
  };

  const storageKeys = {
    account: "edu_account",
    appearance: "edu_appearance",
    notifications: "edu_notifications",
    theme: "edu_theme"
  };

  function loadJSON(key, fallback = {}) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadAccountSettings() {
    const data = loadJSON(storageKeys.account, {});
    if (dom.fullNameInput && data.fullname) {
      dom.fullNameInput.value = data.fullname;
    }
    if (dom.emailInput && data.email) {
      dom.emailInput.value = data.email;
    }
    if (dom.passwordInput) {
      dom.passwordInput.value = "";
    }
  }

  function serializeAccountForm() {
    return {
      fullname: dom.fullNameInput?.value.trim() || "",
      email: dom.emailInput?.value.trim() || ""
    };
  }

  function saveAccountSettings(e) {
    e.preventDefault();
    const payload = serializeAccountForm();
    saveJSON(storageKeys.account, payload);
    alert("Account settings saved.");
    if (dom.passwordInput) dom.passwordInput.value = "";
  }

  function resolveThemeMode(rawMode) {
    if (rawMode === "light" || rawMode === "dark" || rawMode === "system") {
      return rawMode;
    }
    return "light";
  }

  function getSystemPreferredMode() {
    const supportsMatchMedia = typeof window.matchMedia === "function";
    if (!supportsMatchMedia) return "light";

    const prefersDark = window
      .matchMedia("(prefers-color-scheme: dark)")
      .matches;
    return prefersDark ? "dark" : "light";
  }

  function applyThemeMode(mode) {
    const effectiveMode =
      mode === "system"
        ? getSystemPreferredMode()
        : mode;

    if (effectiveMode === "dark") {
      document.body.classList.add("dark-mode");
      localStorage.setItem(storageKeys.theme, "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem(storageKeys.theme, "light");
    }
  }

  function applyThemeColor(colorLabel) {
    const token = (colorLabel || "Professional Blue")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();
    document.body.setAttribute("data-theme-color", token);
  }

  function loadAppearanceSettings() {
    const data = loadJSON(storageKeys.appearance, {});
    const mode = resolveThemeMode(data.mode || "light");
    const color = data.color || "Professional Blue";

    if (dom.themeModeSelect) dom.themeModeSelect.value = mode;
    if (dom.themeColorSelect) dom.themeColorSelect.value = color;

    applyThemeMode(mode);
    applyThemeColor(color);
  }

  function saveAppearanceSettings() {
    const mode = resolveThemeMode(dom.themeModeSelect?.value || "light");
    const color = dom.themeColorSelect?.value || "Professional Blue";

    saveJSON(storageKeys.appearance, { mode, color });
    applyThemeMode(mode);
    applyThemeColor(color);
    alert("Theme updated.");
  }

  function loadNotificationSettings() {
    const data = loadJSON(storageKeys.notifications, {});
    if (dom.emailNotif) {
      dom.emailNotif.checked = data.emailNotif ?? true;
    }
    if (dom.systemAlert) {
      dom.systemAlert.checked = data.systemAlert ?? true;
    }
    if (dom.courseAlert) {
      dom.courseAlert.checked = data.courseAlert ?? false;
    }
  }

  function serializeNotificationForm() {
    return {
      emailNotif: !!dom.emailNotif?.checked,
      systemAlert: !!dom.systemAlert?.checked,
      courseAlert: !!dom.courseAlert?.checked
    };
  }

  function saveNotificationSettings() {
    const payload = serializeNotificationForm();
    saveJSON(storageKeys.notifications, payload);
    alert("Notification settings saved.");
  }

  function bindEvents() {
    accountForm.addEventListener("submit", saveAccountSettings);
    if (dom.applyThemeBtn) {
      dom.applyThemeBtn.addEventListener("click", saveAppearanceSettings);
    }
    if (dom.saveNotifBtn) {
      dom.saveNotifBtn.addEventListener("click", saveNotificationSettings);
    }
  }

  loadAccountSettings();
  loadAppearanceSettings();
  loadNotificationSettings();
  bindEvents();
}

// ==========================================================
// PROFILE
// ==========================================================
function initProfile() {
  const nameInput = $("name");
  const emailInput = $("email");
  const roleInput = $("role");
  const passwordInput = $("password");
  const togglePasswordBtn = $("togglePassword");
  const saveBtn = $("saveBtn");
  const cancelBtn = $("cancelBtn");
  if (!nameInput || !emailInput) return;

  function loadProfile() {
    const account = JSON.parse(localStorage.getItem("edu_account") || "{}");
    if (account.fullname && nameInput) nameInput.value = account.fullname;
    if (account.email && emailInput) emailInput.value = account.email;
    if (passwordInput) passwordInput.value = "********";
  }

  loadProfile();

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type");
      if (type === "password") {
        passwordInput.setAttribute("type", "text");
        togglePasswordBtn.innerHTML = '<i class="bi bi-eye-slash"></i>';
      } else {
        passwordInput.setAttribute("type", "password");
        togglePasswordBtn.innerHTML = '<i class="bi bi-eye"></i>';
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const updated = {
        fullname: nameInput?.value.trim() || "",
        email: emailInput?.value.trim() || ""
      };
      localStorage.setItem("edu_account", JSON.stringify(updated));
      alert("Profile updated.");
      if (passwordInput) passwordInput.value = "********";
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      loadProfile();
    });
  }
}

// ==========================================================
// COURSES PAGE
// ==========================================================
function initCoursesPage() {
  const coursesContainer = $("coursesContainer");
  if (!coursesContainer) return;

  const students = getStudents();
  const searchInput = $("searchInput");
  const categoryFilter = $("categoryFilter");
  const filterBtn = $("filterBtn");
  const addCourseBtn = $("addCourseBtn");

  const baseCourses = [
    { id: 1, title: "Mathematics 101", code: "MATH101", category: "Core Subject", teacher: "Mr. Adams", status: "Active" },
    { id: 2, title: "Science Fundamentals", code: "SCI102", category: "Core Subject", teacher: "Mrs. Lee", status: "Active" },
    { id: 3, title: "English Literature", code: "ENG201", category: "Core Subject", teacher: "Ms. Brown", status: "Active" },
    { id: 4, title: "Computer Basics", code: "IT110", category: "Additional Subject", teacher: "Mr. Kumar", status: "Active" },
    { id: 5, title: "Art & Design", code: "ART120", category: "Additional Subject", teacher: "Ms. Rivera", status: "Inactive" }
  ];

  let courses = baseCourses.map(c => ({
    ...c,
    students: students.filter(s => s.course === c.title).length
  }));

  function renderCourses(list) {
    coursesContainer.innerHTML = "";
    if (!list || !list.length) {
      coursesContainer.innerHTML = '<p class="text-muted text-center">No courses found.</p>';
      return;
    }

    list.forEach(course => {
      const col = document.createElement("div");
      col.className = "col-md-4";

      col.innerHTML = `
        <div class="card course-card shadow-sm h-100">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0">${course.title}</h5>
              <span class="badge bg-${course.status === "Active" ? "success" : "secondary"}">
                ${course.status}
              </span>
            </div>
            <p class="text-muted mb-1">${course.code} • ${course.category}</p>
            <p class="mb-1">
              <span class="enrolled">${course.students} students</span> enrolled
            </p>
            <p class="mb-3"><i class="bi bi-person"></i> ${course.teacher}</p>
            <div class="mt-auto d-flex justify-content-between">
              <button class="btn btn-outline-primary btn-sm">
                <i class="bi bi-pencil-square"></i> Edit
              </button>
              <button class="btn btn-outline-danger btn-sm">
                <i class="bi bi-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      `;
      coursesContainer.appendChild(col);
    });
  }

  renderCourses(courses);

  function applyFilters() {
    const searchValue = (searchInput?.value || "").toLowerCase().trim();
    const selectedCategory = categoryFilter?.value || "All Categories";

    const filtered = courses.filter(course => {
      const matchesSearch =
        !searchValue ||
        course.title.toLowerCase().includes(searchValue) ||
        course.code.toLowerCase().includes(searchValue) ||
        course.teacher.toLowerCase().includes(searchValue);

      const matchesCategory =
        selectedCategory === "All Categories" ||
        course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    renderCourses(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }
  if (filterBtn) {
    filterBtn.addEventListener("click", applyFilters);
  }

  if (addCourseBtn) {
    addCourseBtn.addEventListener("click", () => {
      const title = prompt("Course title:");
      if (!title) return;

      const code = prompt("Course code (e.g., MTH200):") || "NEW000";
      const category =
        prompt("Category (Core Subject / Additional Subject):") ||
        "Additional Subject";

      const newCourse = {
        id: Date.now(),
        title: title.trim(),
        code: code.trim(),
        category: category.trim(),
        students: 0,
        teacher: "TBA",
        status: "Active"
      };

      courses.push(newCourse);
      applyFilters();
    });
  }
}

// ==========================================================
// STUDENTS PAGE
// ==========================================================
function initStudentsPage() {
  const table = document.querySelector("table");
  const tbody = table ? table.querySelector("tbody") : null;
  if (!tbody) return;


  const students = getStudents() || [];


  const searchInput = document.getElementById("studentSearch");
  const statusFilter = document.getElementById("studentStatusFilter");


  function isActiveStatus(status) {
    return status === "Active";
  }


  function createStudentRow(student, index) {
    const isActive = isActiveStatus(student.status);
    const row = document.createElement("tr");


    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.course}</td>
      <td>
        <span class="badge ${isActive ? "bg-success" : "bg-secondary"}">
          ${student.status}
        </span>
      </td>
    `;


    return row;
  }


  function renderStudents(list) {
    tbody.innerHTML = "";
    if (!list.length) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td colspan="5" class="text-center text-muted">
          No students found.
        </td>
      `;
      tbody.appendChild(row);
      return;
    }


    list.forEach((student, index) => {
      const row = createStudentRow(student, index);
      tbody.appendChild(row);
    });
  }


  function applyStudentFilters() {
    const search = (searchInput?.value || "").toLowerCase().trim();
    const status = statusFilter?.value || "All";


    const filtered = students.filter(s => {
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        (s.course || "").toLowerCase().includes(search);


      const matchesStatus =
        status === "All" ||
        s.status === status;


      return matchesSearch && matchesStatus;
    });


    renderStudents(filtered);
  }


  if (searchInput) {
    searchInput.addEventListener("input", applyStudentFilters);
  }
  if (statusFilter) {
    statusFilter.addEventListener("change", applyStudentFilters);
  }


  renderStudents(students);
}
// ==========================================================
// STUDENTS PAGE (search + filter + stats + add student)
// ==========================================================
function initStudentsPage() {
  const table = document.querySelector("table");
  const tbody = table ? table.querySelector("tbody") : null;
  if (!tbody) return; // pastikan hanya jalan di student.html

  const totalEl = $("totalStudents");
  const activeEl = $("activeStudents");
  const inactiveEl = $("inactiveStudents");

  const searchInput = document.getElementById("studentSearch");
  const statusFilter = document.getElementById("studentStatusFilter");
  const addBtn = document.querySelector(".btn.btn-primary"); // butang "Add Student" di header

  let students = getStudents() || [];

  // ---------- helpers ----------
  function isActiveStatus(status) {
    return status === "Active";
  }

  function createStudentRow(student, index) {
    const isActive = isActiveStatus(student.status);
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.course}</td>
      <td>
        <span class="badge ${isActive ? "bg-success" : "bg-secondary"}">
          ${student.status}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${student.id}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    return row;
  }

  function updateStats(list) {
    const data = list || students;
    const total = data.length;
    const active = data.filter(s => s.status === "Active").length;
    const inactive = total - active;

    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (inactiveEl) inactiveEl.textContent = inactive;
  }

  function renderStudents(list) {
    const data = list || students;
    tbody.innerHTML = "";

    if (!data.length) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td colspan="6" class="text-center text-muted">
          No students found.
        </td>
      `;
      tbody.appendChild(row);
      updateStats(data);
      return;
    }

    data.forEach((student, index) => {
      const row = createStudentRow(student, index);
      tbody.appendChild(row);
    });

    updateStats(data);
  }

  function applyStudentFilters() {
    const search = (searchInput?.value || "").toLowerCase().trim();
    const status = statusFilter?.value || "All";

    const filtered = students.filter(s => {
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        (s.course || "").toLowerCase().includes(search);

      const matchesStatus =
        status === "All" ||
        s.status === status;

      return matchesSearch && matchesStatus;
    });

    renderStudents(filtered);
  }

  function handleAddStudent() {
    const name = prompt("Student name:");
    if (!name) return;

    const email = prompt("Student email:");
    if (!email) return;

    const course = prompt("Course (eg: Mathematics 101):") || "Unassigned";

    const newStudent = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      course: course.trim(),
      status: "Active"
    };

    students.push(newStudent);
    saveStudents(students); // simpan ke localStorage
    applyStudentFilters();  // guna filter semasa supaya view konsisten
  }

  // ---------- events ----------
  if (searchInput) {
    searchInput.addEventListener("input", applyStudentFilters);
  }
  if (statusFilter) {
    statusFilter.addEventListener("change", applyStudentFilters);
  }
  if (addBtn) {
    addBtn.addEventListener("click", handleAddStudent);
  }

  // delete student (optional)
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-delete");
    if (!btn) return;
    const id = Number(btn.getAttribute("data-id"));
    if (!confirm("Delete this student?")) return;

    students = students.filter(s => s.id !== id);
    saveStudents(students);
    applyStudentFilters();
  });

  // initial render
  renderStudents(students);
}


// ==========================================================
// GLOBAL INIT
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  safeInit(initDarkMode);
  safeInit(initLogin);
  safeInit(initRegister);
  safeInit(initDashboard);
  safeInit(initCoursesPage);
  safeInit(initStudentsPage);
  safeInit(initAttendance);
  safeInit(initSettings);
  safeInit(initProfile);
});

