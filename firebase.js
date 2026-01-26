// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyCk7Iy8qY2kXiWh1U3jw44mmTB40vK3MN4",
  authDomain: "gbt-study-app.firebaseapp.com",
  projectId: "gbt-study-app",
  storageBucket: "gbt-study-app.firebasestorage.app",
  messagingSenderId: "518639981768",
  appId: "1:518639981768:web:54b37fe4f21fafcc9201fd"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Auth state persistence - stay logged in across browser sessions
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
