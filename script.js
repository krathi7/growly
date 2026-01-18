// 🌱 Grow.ly — Task Logic (Frontend, backend-ready)

// ===== DASHBOARD ELEMENTS =====
const taskList = document.getElementById("taskList");
const taskForm = document.getElementById("taskForm");
const modal = document.getElementById("taskModal");
const cancelBtn = document.querySelector(".cancel-btn");
const addTaskBtn = document.querySelector(".add-task-btn");
const completeSound = document.getElementById("completeSound");
const filterCategory = document.getElementById("filterCategory");
const filterPriority = document.getElementById("filterPriority");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const taskPriority = document.getElementById("taskPriority");

const progressCircle = document.getElementById("progressCircle");
const progressPercent = document.getElementById("progressPercent");
const plant = document.getElementById("plant");

// 📅 Calendar task panel elements
const calendarTaskList = document.getElementById("calendarTaskList");
const calendarTasksTitle = document.getElementById("calendarTasksTitle");

// ✅ FIX: missing form inputs
const taskTitle = document.getElementById("taskTitle");
const taskDate = document.getElementById("taskDate");
const taskStartTime = document.getElementById("taskStartTime");
const taskEndTime = document.getElementById("taskEndTime");
const taskCategory = document.getElementById("taskCategory");

let selectedDate = null;
let tasks = [];

// 💾 Local Storage Helpers
function saveTasks() {
  localStorage.setItem("growlyTasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("growlyTasks");
  if (saved) {
    tasks = JSON.parse(saved);
  }
}

// 🗓️ helper: today date (yyyy-mm-dd)
function today() {
  return new Date().toISOString().split("T")[0];
}
// ===============================
// 🧠 DASHBOARD-ONLY LOGIC
// ===============================
if (addTaskBtn && taskForm) {

  addTaskBtn.addEventListener("click", () => {
    modal.classList.add("active");
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const task = {
  id: Date.now(),
  title: taskTitle.value,
  date: taskDate.value || today(),
  time: taskStartTime.value && taskEndTime.value
    ? `${taskStartTime.value}-${taskEndTime.value}`
    : null,
  category: taskCategory.value,
  priority: taskPriority.value, // ✅ FIX
  completed: false
};


    tasks.push(task);
    saveTasks();
    renderTasks();
    renderCalendar();
    renderPlanner();


    modal.classList.remove("active");
    taskForm.reset();
  });

  filterCategory.addEventListener("change", renderTasks);
  filterPriority.addEventListener("change", renderTasks);
}

// ===============================
// 🧱 Render today’s tasks
// ===============================
function renderTasks() {
  if (!taskList) return;

  taskList.innerHTML = "";

  let todaysTasks = tasks.filter(t => t.date === today());

  if (filterCategory && filterCategory.value !== "All") {
    todaysTasks = todaysTasks.filter(t => t.category === filterCategory.value);
  }

  if (filterPriority && filterPriority.value !== "All") {
    todaysTasks = todaysTasks.filter(t => t.priority === filterPriority.value);
  }

  if (todaysTasks.length === 0) {
    taskList.innerHTML = `<p class="progress-text">Nothing planned today 🌸</p>`;
    if (progressCircle) updateProgress();
    return;
  }

  todaysTasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "task-card";
    if (task.completed) card.classList.add("completed");

    card.innerHTML = `
      <label class="custom-checkbox">
        <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}/>
        <span class="checkmark"></span>
      </label>

      <span>${task.title}</span>

      <div class="task-meta">
        <span class="category">${task.category}</span>
        <span class="priority ${task.priority}"></span>

        <button class="delete-btn">
          <img src="bin.png" alt="delete" class="bin-icon" />
        </button>
      </div>
    `;

    const checkbox = card.querySelector(".task-checkbox");
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();

      if (task.completed) {
        card.classList.add("completed");
        if (completeSound) {
          completeSound.currentTime = 0;
          completeSound.volume = 0.3;
          completeSound.play();
        }
      } else {
        card.classList.remove("completed");
      }

      renderCalendar();
      if (progressCircle) updateProgress();
    });

    const deleteBtn = card.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
      renderCalendar();
    });

    taskList.appendChild(card);
  });

  if (progressCircle) updateProgress();
}


/// ===============================
// 🌱 Progress logic (today only)
// ===============================
function updateProgress() {
  if (!progressCircle) return;

  const todaysTasks = tasks.filter(t => t.date === today());
  const completed = todaysTasks.filter(t => t.completed).length;
  const total = todaysTasks.length;

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  progressPercent.textContent = `${percent}%`;

  const deg = (percent / 100) * 360;
  progressCircle.style.background = `conic-gradient(
    var(--matcha) ${deg}deg,
    #eee ${deg}deg
  )`;

  if (percent === 0) plant.textContent = "🌱";
  else if (percent <= 30) plant.textContent = "🌿";
  else if (percent <= 60) plant.textContent = "🌿🌿";
  else if (percent < 100) plant.textContent = "🌼";
  else plant.textContent = "🌸";
}
// ===============================
// 📅 Calendar Logic
// ===============================



const calendarGrid = document.getElementById("calendarGrid");
const calendarTitle = document.getElementById("calendarTitle");

let todayDate = new Date();
let currentMonth = todayDate.getMonth();
let currentYear = todayDate.getFullYear();

if (prevMonthBtn && nextMonthBtn) {
  prevMonthBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });
}

// ===============================
// 🌱 Day status helper
// ===============================
function getDayStatus(dateStr) {
  const dayTasks = tasks.filter(t => t.date === dateStr);
  if (dayTasks.length === 0) return null;

  const completedCount = dayTasks.filter(t => t.completed).length;
  if (completedCount === dayTasks.length) return "completed";
  return "pending";
}

function renderCalendar() {
  if (!calendarGrid || !calendarTitle) return;

  calendarGrid.innerHTML = `
    <div class="day-name">Sun</div>
    <div class="day-name">Mon</div>
    <div class="day-name">Tue</div>
    <div class="day-name">Wed</div>
    <div class="day-name">Thu</div>
    <div class="day-name">Fri</div>
    <div class="day-name">Sat</div>
  `;

  const year = currentYear;
  const month = currentMonth;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  calendarTitle.textContent = `${monthNames[month]} ${year}`;

  for (let i = firstDay - 1; i >= 0; i--) {
    const div = document.createElement("div");
    div.className = "date-card muted";
    div.textContent = daysInPrevMonth - i;
    calendarGrid.appendChild(div);
  }

  const today = new Date();

  for (let day = 1; day <= daysInMonth; day++) {
    const div = document.createElement("div");
    div.className = "date-card";
    div.textContent = day;

    const dateStr =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const status = getDayStatus(dateStr);

    if (status === "completed") {
      div.classList.add("completed-day");
      const img = document.createElement("img");
      img.src = "strawberry.png";
      img.className = "date-icon";
      div.appendChild(img);
    }

    if (status === "pending") {
      div.classList.add("pending-day");
      const img = document.createElement("img");
      img.src = "waiting.png";
      img.className = "date-icon";
      div.appendChild(img);
    }

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      div.classList.add("today");
    }

    // ✅ DATE CLICK HANDLER
    // ✅ DATE CLICK HANDLER
div.addEventListener("click", () => {
  selectedDate = new Date(year, month, day);

  document.querySelectorAll(".date-card").forEach(d =>
    d.classList.remove("selected")
  );

  div.classList.add("selected");

  renderCalendarTasks(selectedDate);
  renderPlanner();
});


    calendarGrid.appendChild(div);
  }

  const totalCells = calendarGrid.children.length;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  for (let i = 1; i <= remaining; i++) {
    const div = document.createElement("div");
    div.className = "date-card muted";
    div.textContent = i;
    calendarGrid.appendChild(div);
  }
}
// ===============================
// 🧩 FULL-FEATURED CALENDAR TASK RENDERER (REPLACED)
// ===============================
function renderCalendarTasks(dateObj) {
  if (!calendarTaskList || !calendarTasksTitle) return;

  const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;

  const options = { month: "short", day: "numeric", year: "numeric" };
  calendarTasksTitle.textContent =
    `Tasks for ${dateObj.toLocaleDateString(undefined, options)}`;

  calendarTaskList.innerHTML = "";

  const dayTasks = tasks.filter(t => t.date === dateStr);

  if (dayTasks.length === 0) {
    calendarTaskList.innerHTML =
      `<p class="progress-text">Nothing planned for this day 🌸</p>`;
    return;
  }

  dayTasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "task-card";
    if (task.completed) card.classList.add("completed");

    card.innerHTML = `
      <label class="custom-checkbox">
        <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}/>
        <span class="checkmark"></span>
      </label>

      <span>${task.title}</span>

      <div class="task-meta">
        <span class="category">${task.category}</span>
        <span class="priority ${task.priority}"></span>
        <button class="delete-btn">
          <img src="bin.png" alt="delete" class="bin-icon" />
        </button>
      </div>
    `;

    const checkbox = card.querySelector(".task-checkbox");
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;

      if (task.completed) {
        card.classList.add("completed");
        if (completeSound) {
          completeSound.currentTime = 0;
          completeSound.volume = 0.3;
          completeSound.play();
        }
      } else {
        card.classList.remove("completed");
      }

      saveTasks();
      renderCalendar();
      renderCalendarTasks(dateObj);
      renderPlanner(); // keep planner in sync
    });

    const deleteBtn = card.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderCalendar();
      renderCalendarTasks(dateObj);
      renderPlanner();
    });

    calendarTaskList.appendChild(card);
  });
}

// ===============================
// 🕘 Planner Helpers
// ===============================
function getStartHour(timeRange) {
  if (!timeRange) return null;
  return Number(timeRange.split(":")[0]);
}

function createPlannerTask(task) {
  const card = document.createElement("div");
  card.className = "planner-task";

  const pinkShades = ["pink-1", "pink-2", "pink-3"];
  const greenShades = ["green-1", "green-2", "green-3"];

  if (task.category && task.category.toLowerCase().includes("personal")) {
    card.classList.add(
      pinkShades[Math.floor(Math.random() * pinkShades.length)]
    );
  } else {
    card.classList.add(
      greenShades[Math.floor(Math.random() * greenShades.length)]
    );
  }

  if (task.completed) {
    card.classList.add("completed");
    card.style.opacity = "0.6";
  }

  const timeText = task.time ? task.time.replace("-", " – ") : "";

  // 🕒 MULTI-HOUR HEIGHT LOGIC (ADDED)
  if (task.time) {
    const [start, end] = task.time.split("-");
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    const durationHours = Math.max((endMinutes - startMinutes) / 60, 1);

    const hourHeight = 90; // must match .time-slot min-height
    card.style.height = `${durationHours * hourHeight}px`;
  }

  // ✅ ADD PRIORITY DOT HERE
  card.innerHTML = `
    <div class="planner-task-header">
      <span class="task-title">${task.title}</span>
      <span class="priority ${task.priority}"></span>
    </div>
    ${timeText ? `<div class="task-time">${timeText}</div>` : ""}
  `;

  return card;
}







function renderAnytimeTasks() {
  const anytimeList = document.getElementById("anytimeTaskList");
  if (!anytimeList) return;

  const dateObj = selectedDate || new Date();
  const dateStr = dateObj.toISOString().split("T")[0];

  anytimeList.innerHTML = "";

  tasks
    .filter(t => t.date === dateStr && !t.time)
    .forEach(task => {
      anytimeList.appendChild(createPlannerTask(task));
    });
}

const plannerTimeline = document.getElementById("plannerTimeline");

function renderPlannerGrid() {
  if (!plannerTimeline) return;

  plannerTimeline.innerHTML = "";

  for (let hour = 5; hour <= 24; hour++) {
    const row = document.createElement("div");
    row.className = "time-row";

    const label = document.createElement("span");
    label.className = "time-label";
    label.textContent =
      hour === 12 ? "12 PM" :
      hour > 12 ? `${hour - 12} PM` :
      `${hour} AM`;

    const slot = document.createElement("div");
    slot.className = "time-slot";
    slot.dataset.hour = hour;

    row.appendChild(label);
    row.appendChild(slot);
    plannerTimeline.appendChild(row);
  }
}

function renderPlanner() {
  renderPlannerGrid();
  renderAnytimeTasks();

  const dateObj = selectedDate || new Date();
  const dateStr = dateObj.toISOString().split("T")[0];

  tasks
    .filter(t => t.date === dateStr && t.time)
    .forEach(task => {
      const hour = getStartHour(task.time);
      const slot = document.querySelector(`.time-slot[data-hour="${hour}"]`);
      if (slot) slot.appendChild(createPlannerTask(task));
    });
}
function getTaskDurationInHours(timeRange) {
  if (!timeRange) return 1;

  const [start, end] = timeRange.split("-");
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  return Math.max((endMinutes - startMinutes) / 60, 1);
}


// ===============================
// 🚀 INIT (ONLY ONE — FINAL)
// ===============================
loadTasks();
renderTasks();
renderCalendar();
renderPlanner();
renderCalendarTasks(selectedDate || new Date());
