0// 🌱 Grow.ly — Task Logic (Frontend, backend-ready)

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
const taskTitle = document.getElementById("taskTitle");
const taskDate = document.getElementById("taskDate");
const taskStartTime = document.getElementById("taskStartTime");
const taskEndTime = document.getElementById("taskEndTime");
const taskCategory = document.getElementById("taskCategory");

const progressCircle = document.getElementById("progressCircle");
const progressPercent = document.getElementById("progressPercent");
const plant = document.getElementById("plant");

// 📅 Calendar task panel elements
const calendarTaskList = document.getElementById("calendarTaskList");
const calendarTasksTitle = document.getElementById("calendarTasksTitle");

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

// ===============================
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
    });

    const deleteBtn = card.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderCalendar();
      renderCalendarTasks(dateObj);
    });

    calendarTaskList.appendChild(card);
  });
}

// ===============================
// 🚀 INIT
// ===============================
loadTasks();
renderTasks();
renderCalendar();
renderPlanner();


// ===============================
// 🕘 Planner — Dynamic Hour Grid
// ===============================
// ===============================
// 🕘 Planner Helpers
// ===============================

// extract start hour from "10:00-11:30"
function getStartHour(timeRange) {
  if (!timeRange) return null;
  const start = timeRange.split("-")[0];
  return Number(start.split(":")[0]);
}

// create task card for planner (ONLY planner)
function createPlannerTask(task) {
  const card = document.createElement("div");

  // ✅ FIX: planner CSS expects this
  card.className = "planner-task";

  if (task.completed) card.classList.add("completed");

  card.innerHTML = `
    <label class="custom-checkbox">
      <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}/>
      <span class="checkmark"></span>
    </label>
    <span>${task.title}</span>
  `;

  const checkbox = card.querySelector(".task-checkbox");
  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    saveTasks();
    renderTasks();
    renderCalendar();   // ✅ calendar stays
    renderPlanner();    // ✅ planner refresh
  });

  return card;
}

function renderAnytimeTasks() {
  const anytimeList = document.getElementById("anytimeTaskList");
  if (!anytimeList) return;

  const dateObj = selectedDate || new Date();
  const dateStr =
    `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;

  anytimeList.innerHTML = "";

  const anytimeTasks = tasks.filter(
    t => t.date === dateStr && !t.time
  );

  if (anytimeTasks.length === 0) {
    anytimeList.innerHTML =
      `<p class="progress-text">No flexible tasks 🌱</p>`;
    return;
  }

  anytimeTasks.forEach(task => {
    const card = createPlannerTask(task);
    anytimeList.appendChild(card);
  });
}


const plannerTimeline = document.getElementById("plannerTimeline");

function renderPlannerGrid() {
  if (!plannerTimeline) return;

  plannerTimeline.innerHTML = "";

const startHour = 5;   
const endHour = 24;     

  for (let hour = startHour; hour <= endHour; hour++) {
    const row = document.createElement("div");
    row.className = "time-row";

    const label = document.createElement("span");
    label.className = "time-label";

   let displayHour;

if (hour === 0 || hour === 24) {
  displayHour = "12 AM";
} else if (hour === 12) {
  displayHour = "12 PM";
} else if (hour > 12) {
  displayHour = `${hour - 12} PM`;
} else {
  displayHour = `${hour} AM`;
}


    label.textContent = displayHour;

    const slot = document.createElement("div");
    slot.className = "time-slot";
    slot.dataset.hour = hour; // 🔑 important for task placement later

    row.appendChild(label);
    row.appendChild(slot);
    plannerTimeline.appendChild(row);
  }
}
renderPlannerGrid();

function renderPlanner() {
  renderPlannerGrid(); // reset grid first
  renderAnytimeTasks();

  const dateToShow = selectedDate || new Date();
  const dateStr =
    `${dateToShow.getFullYear()}-${String(dateToShow.getMonth() + 1).padStart(2, "0")}-${String(dateToShow.getDate()).padStart(2, "0")}`;

  const todaysTasks = tasks.filter(t => t.date === dateStr);

  todaysTasks.forEach(task => {
    if (!task.time) return; // skip no-time tasks for now

    const hour = getStartHour(task.time);
    if (hour === null) return;

    const slot = document.querySelector(
      `.time-slot[data-hour="${hour}"]`
    );

    if (!slot) return;

    const card = createPlannerTask(task);
    slot.appendChild(card);
  });
}


function renderPlannerTasks(dateObj) {
  if (!plannerTimeline) return;

  // clear old tasks
  plannerTimeline.querySelectorAll(".planner-task").forEach(t => t.remove());

  const dateStr =
    `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;

  const dayTasks = tasks.filter(t => t.date === dateStr);

  dayTasks.forEach(task => {
    const taskEl = document.createElement("div");
    taskEl.className = "planner-task";
    taskEl.textContent = task.title;

    // ✅ timed task
    if (task.time) {
      const startHour = parseInt(task.time.split(":")[0], 10);
      const slot = plannerTimeline.querySelector(
        `.time-slot[data-hour="${startHour}"]`
      );

      if (slot) slot.appendChild(taskEl);
    }
    // 🟡 anytime task → first free slot
    else {
      const firstSlot = plannerTimeline.querySelector(".time-slot");
      if (firstSlot) firstSlot.appendChild(taskEl);
    }
  });
}
