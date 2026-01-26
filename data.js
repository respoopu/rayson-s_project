// User data object
const user = {
  xp: 0,
  studySeconds: 0,
  progress: 0,

  ownedItems: [],
  equippedItem: null,
  unlockedAccessories: [],

  // Tasks
  activeTasks: [],      // Array of { id, text, createdAt }
  completedTasks: []    // Array of { id, text, completedAt }
};

const MAX_ACTIVE_TASKS = 6;

// Save data to Firestore
async function saveData() {
  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    await db.collection('users').doc(userId).update({
      xp: user.xp,
      studySeconds: user.studySeconds,
      progress: user.progress,
      ownedItems: user.ownedItems,
      equippedItem: user.equippedItem,
      unlockedAccessories: user.unlockedAccessories,
      activeTasks: user.activeTasks,
      completedTasks: user.completedTasks
    });
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

// Load data from Firestore
async function loadData() {
  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    const doc = await db.collection('users').doc(userId).get();
    if (doc.exists) {
      const data = doc.data();
      user.xp = data.xp || 0;
      user.studySeconds = data.studySeconds || 0;
      user.progress = data.progress || 0;
      user.ownedItems = data.ownedItems || [];
      user.equippedItem = data.equippedItem || null;
      user.unlockedAccessories = data.unlockedAccessories || [];
      user.activeTasks = data.activeTasks || [];
      user.completedTasks = data.completedTasks || [];

      // Clean up old completed tasks
      cleanOldCompletedTasks();
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

function cleanOldCompletedTasks() {
  const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  user.completedTasks = user.completedTasks.filter(task => task.completedAt > oneMonthAgo);
}

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
  { name: "hat", unlockAtLevel: 3 },
  { name: "scarf", unlockAtLevel: 6 },
  { name: "mustache", unlockAtLevel: 10 },
  { name: "wine", unlockAtLevel: 15 }
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

// Motivational quotes for studying
const studyQuotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.", author: "Richard Feynman" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.", author: "Colin Powell" },
  { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
  { text: "The mind is not a vessel to be filled but a fire to be ignited.", author: "Plutarch" },
  { text: "Learning is not attained by chance, it must be sought for with ardor and attended to with diligence.", author: "Abigail Adams" },
  { text: "The only person who is educated is the one who has learned how to learn and change.", author: "Carl Rogers" },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
  { text: "The harder the battle, the sweeter the victory.", author: "Les Brown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Little things make big days.", author: "Unknown" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { text: "Believe in yourself and all that you are.", author: "Christian D. Larson" },
  { text: "The only way to achieve the impossible is to believe it is possible.", author: "Charles Kingsleigh" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Sometimes later becomes never. Do it now.", author: "Unknown" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett" },
  { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
  { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { text: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem" },
  { text: "Work hard in silence, let your success be your noise.", author: "Frank Ocean" },
  { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "If you want to achieve greatness stop asking for permission.", author: "Unknown" },
  { text: "Things work out best for those who make the best of how things work out.", author: "John Wooden" },
  { text: "To live a creative life, we must lose our fear of being wrong.", author: "Joseph Chilton Pearce" },
  { text: "If you are not willing to risk the usual, you will have to settle for the ordinary.", author: "Jim Rohn" },
  { text: "All progress takes place outside the comfort zone.", author: "Michael John Bobak" },
  { text: "People who are crazy enough to think they can change the world, are the ones who do.", author: "Rob Siltanen" },
  { text: "If you do what you always did, you will get what you always got.", author: "Unknown" },
  { text: "Successful people do what unsuccessful people are not willing to do.", author: "Jim Rohn" },
  { text: "Try not to become a person of success, but rather try to become a person of value.", author: "Albert Einstein" },
  { text: "Never give up on a dream just because of the time it will take to accomplish it.", author: "Earl Nightingale" },
  { text: "Everything comes to him who hustles while he waits.", author: "Thomas Edison" },
  { text: "The only thing standing between you and your goal is the story you keep telling yourself.", author: "Jordan Belfort" },
  { text: "Knowledge is power. Information is liberating.", author: "Kofi Annan" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "Education is not preparation for life; education is life itself.", author: "John Dewey" },
  { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" },
  { text: "Anyone who stops learning is old, whether at twenty or eighty.", author: "Henry Ford" },
  { text: "Develop a passion for learning. If you do, you will never cease to grow.", author: "Anthony J. D'Angelo" },
  { text: "Study without desire spoils the memory, and it retains nothing that it takes in.", author: "Leonardo da Vinci" },
  { text: "The educated differ from the uneducated as much as the living from the dead.", author: "Aristotle" },
  { text: "A little progress each day adds up to big results.", author: "Satya Nani" },
  { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
  { text: "You learn more from failure than from success.", author: "Unknown" },
  { text: "It's not about perfect. It's about effort.", author: "Jillian Michaels" },
  { text: "The secret of success is to do the common thing uncommonly well.", author: "John D. Rockefeller" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { text: "Knowing is not enough; we must apply. Wishing is not enough; we must do.", author: "Johann Wolfgang von Goethe" },
  { text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou" },
  { text: "We may encounter many defeats but we must not be defeated.", author: "Maya Angelou" },
  { text: "Perseverance is not a long race; it is many short races one after the other.", author: "Walter Elliot" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale" }
];

function getDailyQuote() {
  // Use date as seed for consistent daily quote
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % studyQuotes.length;
  return studyQuotes[index];
}
