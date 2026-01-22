const user = {
  xp: 0,
  studySeconds: 0,
  progress: 0,

  ownedItems: [],
  equippedItem: null,
  unlockedAccessories: []
};

function saveData() {
  localStorage.setItem("studyUser", JSON.stringify(user));
}

function loadData() {
  const data = localStorage.getItem("studyUser");
  if (data) {
    Object.assign(user, JSON.parse(data));
  }
}

loadData();

// Level thresholds (in minutes of study time)
const levels = [
  { level: 1, minProgress: 0 },
  { level: 2, minProgress: 60 },      // 1 hour
  { level: 3, minProgress: 180 },     // 3 hours
  { level: 4, minProgress: 360 },     // 6 hours
  { level: 5, minProgress: 600 },     // 10 hours
  { level: 6, minProgress: 900 },     // 15 hours
  { level: 7, minProgress: 1260 },    // 21 hours
  { level: 8, minProgress: 1680 },    // 28 hours
  { level: 9, minProgress: 2160 },    // 36 hours
  { level: 10, minProgress: 2700 },   // 45 hours
  { level: 11, minProgress: 3300 },   // 55 hours
  { level: 12, minProgress: 3960 },   // 66 hours
  { level: 13, minProgress: 4680 },   // 78 hours
  { level: 14, minProgress: 5460 },   // 91 hours
  { level: 15, minProgress: 6300 },   // 105 hours
  { level: 16, minProgress: 7200 },   // 120 hours
  { level: 17, minProgress: 8160 },   // 136 hours
  { level: 18, minProgress: 9180 },   // 153 hours
  { level: 19, minProgress: 10260 },  // 171 hours
  { level: 20, minProgress: 11400 },  // 190 hours
];

// Accessory unlock milestones (now based on levels)
// Names must match the image filenames in assets/accessories/
const accessories = [
  { name: "level_1-removebg-preview", unlockAtLevel: 3 },
  { name: "level_2-removebg-preview", unlockAtLevel: 6 },
  { name: "level_3-removebg-preview", unlockAtLevel: 10 },
  { name: "level_4_v2-removebg-preview", unlockAtLevel: 15 },
  { name: "level_5-removebg-preview", unlockAtLevel: 20 }
];

// Shop items (name must match image filename in assets/items/)
const shopItems = {
  basil: { price: 50 },
  onion: { price: 75 },
  butter: { price: 100 },
  tomato: { price: 125 },
  grape: { price: 150 },
  cheese: { price: 200 },
  garlic: { price: 250 },
  ham: { price: 300 },
  tower: { price: 500 }
};
