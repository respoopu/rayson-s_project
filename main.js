let startTime = null;
let timerInterval = null;

const timerEl = document.getElementById("timer");
const xpEl = document.getElementById("xp");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const progressBar = document.getElementById("progress-bar");
const hoursEl = document.getElementById("hours");
const levelEl = document.getElementById("level");
const levelProgressBar = document.getElementById("level-progress-bar");
const levelProgressText = document.getElementById("level-progress-text");

function startTimer() {
  startTime = Date.now();
  startBtn.disabled = true;
  stopBtn.disabled = false;

  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  timerEl.textContent =
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0");
}

function stopTimer() {
  clearInterval(timerInterval);
  startBtn.disabled = false;
  stopBtn.disabled = true;

  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

  // Save study time
  user.studySeconds += elapsedSeconds;

  // XP RULE: 10 XP per full minute
  const earnedXP = Math.floor(elapsedSeconds / 60) * 10;
  user.xp += earnedXP;

  // Progress (used later for accessories)
  user.progress += elapsedSeconds / 60;

  checkAccessoryUnlocks();
  saveData();
  updateUI();
}

function getLevel() {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (user.progress >= levels[i].minProgress) {
      return levels[i].level;
    }
  }
  return 1;
}

function getLevelProgress() {
  const currentLevel = getLevel();
  const currentLevelData = levels.find(l => l.level === currentLevel);
  const nextLevelData = levels.find(l => l.level === currentLevel + 1);

  if (!nextLevelData) {
    return { current: user.progress, needed: currentLevelData.minProgress, percent: 100 };
  }

  const progressInLevel = user.progress - currentLevelData.minProgress;
  const progressNeeded = nextLevelData.minProgress - currentLevelData.minProgress;
  const percent = Math.min((progressInLevel / progressNeeded) * 100, 100);

  return { current: progressInLevel, needed: progressNeeded, percent };
}

function checkAccessoryUnlocks() {
  const currentLevel = getLevel();
  accessories.forEach(acc => {
    if (currentLevel >= acc.unlockAtLevel && !user.unlockedAccessories.includes(acc.name)) {
      user.unlockedAccessories.push(acc.name);
    }
  });
}

function updateUI() {
  xpEl.textContent = user.xp;

  // Total progress bar
  const percent = Math.min((user.progress / 30000) * 100, 100);
  progressBar.style.width = percent + "%";
  hoursEl.textContent = (user.progress / 60).toFixed(1);

  // Level display
  const currentLevel = getLevel();
  const levelProgress = getLevelProgress();

  levelEl.textContent = currentLevel;
  levelProgressBar.style.width = levelProgress.percent + "%";

  if (levelProgress.percent >= 100) {
    levelProgressText.textContent = "MAX LEVEL";
  } else {
    const minutesLeft = Math.ceil(levelProgress.needed - levelProgress.current);
    levelProgressText.textContent = `${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m to Level ${currentLevel + 1}`;
  }

  renderCharacter();

  const unequipBtn = document.getElementById("unequip-btn");
  const unequipMain = document.getElementById("unequip-main");
  if (unequipBtn) unequipBtn.disabled = !user.equippedItem;
  if (unequipMain) unequipMain.disabled = !user.equippedItem;
}

startBtn.onclick = startTimer;
stopBtn.onclick = stopTimer;

checkAccessoryUnlocks();
saveData();
updateUI();

function renderCharacter() {
  // Equipped item
  const itemImg = document.getElementById("equipped-item");

  if (user.equippedItem) {
    itemImg.src = `assets/items/${user.equippedItem}.png`;
    itemImg.style.display = "block";
  } else {
    itemImg.style.display = "none";
  }

  // Accessories
  accessories.forEach(acc => {
    const img = document.getElementById(acc.name);

    if (user.unlockedAccessories.includes(acc.name)) {
      img.src = `assets/accessories/${acc.name}.png`;
      img.style.display = "block";
    } else {
      img.style.display = "none";
    }
  });
}

renderCharacter();

function unequipItem() {
  user.equippedItem = null;
  saveData();
  renderCharacter();
  updateUI();
}

const unequipMainBtn = document.getElementById("unequip-main");
if (unequipMainBtn) unequipMainBtn.onclick = unequipItem;

// ----------------------
// TASK TRACKER
// ----------------------
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const activeTasksList = document.getElementById("active-tasks");
const completedTasksList = document.getElementById("completed-tasks");
const taskCountEl = document.getElementById("task-count");
const viewCompletedBtn = document.getElementById("view-completed-btn");
const completedModal = document.getElementById("completed-modal");
const closeModalBtn = document.getElementById("close-modal-btn");

// Initialize tasks arrays if they don't exist
if (!user.activeTasks) user.activeTasks = [];
if (!user.completedTasks) user.completedTasks = [];

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  if (user.activeTasks.length >= MAX_ACTIVE_TASKS) {
    alert(`Maximum ${MAX_ACTIVE_TASKS} tasks allowed. Complete some tasks first!`);
    return;
  }

  const task = {
    id: Date.now(),
    text: text,
    createdAt: Date.now()
  };

  user.activeTasks.push(task);
  taskInput.value = "";
  saveData();
  renderTasks();
}

function completeTask(taskId) {
  const taskIndex = user.activeTasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return;

  const task = user.activeTasks[taskIndex];
  user.activeTasks.splice(taskIndex, 1);

  user.completedTasks.push({
    id: task.id,
    text: task.text,
    completedAt: Date.now()
  });

  saveData();
  renderTasks();
}

function deleteTask(taskId) {
  user.activeTasks = user.activeTasks.filter(t => t.id !== taskId);
  saveData();
  renderTasks();
}

function renderTasks() {
  // Update count
  taskCountEl.textContent = user.activeTasks.length;

  // Render active tasks
  if (user.activeTasks.length === 0) {
    activeTasksList.innerHTML = '<li class="empty-message">No tasks yet. Add one above!</li>';
  } else {
    activeTasksList.innerHTML = user.activeTasks.map(task => `
      <li class="task-item" data-id="${task.id}">
        <div class="task-checkbox" onclick="completeTask(${task.id})"></div>
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="task-delete" onclick="deleteTask(${task.id})">&times;</button>
      </li>
    `).join("");
  }

  // Render completed tasks
  if (user.completedTasks.length === 0) {
    completedTasksList.innerHTML = '<li class="empty-message">No completed tasks in the past 30 days.</li>';
  } else {
    // Sort by most recent first
    const sorted = [...user.completedTasks].sort((a, b) => b.completedAt - a.completedAt);
    completedTasksList.innerHTML = sorted.map(task => `
      <li class="task-item completed">
        <div class="task-checkbox checked">&#10003;</div>
        <div style="flex:1">
          <span class="task-text">${escapeHtml(task.text)}</span>
          <div class="task-date">${formatDate(task.completedAt)}</div>
        </div>
      </li>
    `).join("");
  }

  // Disable add button if at max
  if (addTaskBtn) {
    addTaskBtn.disabled = user.activeTasks.length >= MAX_ACTIVE_TASKS;
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function openCompletedModal() {
  completedModal.classList.remove("hidden");
}

function closeCompletedModal() {
  completedModal.classList.add("hidden");
}

// Event listeners for tasks
if (addTaskBtn) {
  addTaskBtn.onclick = addTask;
}

if (taskInput) {
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
  });
}

if (viewCompletedBtn) {
  viewCompletedBtn.onclick = openCompletedModal;
}

if (closeModalBtn) {
  closeModalBtn.onclick = closeCompletedModal;
}

if (completedModal) {
  completedModal.onclick = (e) => {
    if (e.target === completedModal) closeCompletedModal();
  };
}

// Initial render of tasks
renderTasks();

// ----------------------
// QUOTE OF THE DAY
// ----------------------
const quoteTextEl = document.getElementById("quote-text");
const quoteAuthorEl = document.getElementById("quote-author");

function displayDailyQuote() {
  if (!quoteTextEl || !quoteAuthorEl) return;

  const quote = getDailyQuote();
  quoteTextEl.textContent = quote.text;
  quoteAuthorEl.textContent = quote.author;
}

displayDailyQuote();
