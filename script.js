// 🌱 Grow.ly — Progress Logic (Today Only)

const checkboxes = document.querySelectorAll(".task-checkbox");
const progressCircle = document.getElementById("progressCircle");
const progressPercent = document.getElementById("progressPercent");
const plant = document.getElementById("plant");

function updateProgress() {
  const totalTasks = checkboxes.length;
  const completedTasks = document.querySelectorAll(".task-checkbox:checked").length;

  const percent = totalTasks === 0
    ? 0
    : Math.round((completedTasks / totalTasks) * 100);

  // Update percentage text
  progressPercent.textContent = `${percent}%`;

  // Update circular progress
  const degrees = (percent / 100) * 360;
  progressCircle.style.background = `
    conic-gradient(
      var(--matcha) ${degrees}deg,
      #eee ${degrees}deg
    )
  `;

  // 🌸 Plant growth stages
  if (percent === 0) {
    plant.textContent = "🌱";
  } else if (percent <= 30) {
    plant.textContent = "🌿";
  } else if (percent <= 60) {
    plant.textContent = "🌿🌿";
  } else if (percent < 100) {
    plant.textContent = "🌼";
  } else {
    plant.textContent = "🌸";
  }
}

checkboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    const taskCard = cb.closest(".task-card");

    if (cb.checked) {
      taskCard.classList.add("completed");
    } else {
      taskCard.classList.remove("completed");
    }

    updateProgress();
  });
});
// 🌸 Add Task Modal (UI only)

const addTaskBtn = document.querySelector(".add-task-btn");
const modal = document.getElementById("taskModal");
const cancelBtn = document.querySelector(".cancel-btn");

addTaskBtn.addEventListener("click", () => {
  modal.classList.add("active");
});

cancelBtn.addEventListener("click", () => {
  modal.classList.remove("active");
});

// Initial load
updateProgress();
