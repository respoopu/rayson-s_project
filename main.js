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
