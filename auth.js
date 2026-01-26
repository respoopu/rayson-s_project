// ==========================================
// FIREBASE AUTHENTICATION
// ==========================================

let currentUser = null;

// Listen for auth state changes
function initAuth(onLoggedIn, onLoggedOut) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      currentUser = user;
      if (onLoggedIn) onLoggedIn(user);
    } else {
      currentUser = null;
      if (onLoggedOut) onLoggedOut();
    }
  });
}

// Get current user
function getCurrentUser() {
  return currentUser;
}

// Get current user's display name or email
function getCurrentUserName() {
  if (!currentUser) return null;
  return currentUser.displayName || currentUser.email.split('@')[0];
}

// Get current user's ID
function getCurrentUserId() {
  return currentUser ? currentUser.uid : null;
}

// Check if user is logged in
function isLoggedIn() {
  return currentUser !== null;
}

// Sign up with email and password
async function signUp(email, password, displayName) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);

    // Set display name
    await userCredential.user.updateProfile({
      displayName: displayName
    });

    // Create user document in Firestore with initial data
    await db.collection('users').doc(userCredential.user.uid).set({
      displayName: displayName,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      xp: 0,
      studySeconds: 0,
      progress: 0,
      ownedItems: [],
      equippedItem: null,
      unlockedAccessories: [],
      activeTasks: [],
      completedTasks: []
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// Sign in with email and password
async function signIn(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// Sign out
async function logout() {
  try {
    await auth.signOut();
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// Convert Firebase error codes to user-friendly messages
function getErrorMessage(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled';
    case 'auth/weak-password':
      return 'Password is too weak (min 6 characters)';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    default:
      return 'An error occurred. Please try again';
  }
}

// Require authentication - redirect to login if not logged in
function requireAuth() {
  // This is now handled by initAuth with callbacks
  return true;
}

// ==========================================
// LOGIN PAGE UI FUNCTIONS
// ==========================================

function showLogin() {
  document.getElementById("login-form").classList.remove("hidden");
  document.getElementById("signup-form").classList.add("hidden");
  document.getElementById("login-tab").classList.add("active");
  document.getElementById("signup-tab").classList.remove("active");
  clearErrors();
}

function showSignup() {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("signup-form").classList.remove("hidden");
  document.getElementById("login-tab").classList.remove("active");
  document.getElementById("signup-tab").classList.add("active");
  clearErrors();
}

function clearErrors() {
  const loginError = document.getElementById("login-error");
  const signupError = document.getElementById("signup-error");
  if (loginError) loginError.textContent = "";
  if (signupError) signupError.textContent = "";
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const submitBtn = event.target.querySelector('button[type="submit"]');

  // Disable button while processing
  submitBtn.disabled = true;
  submitBtn.textContent = "Logging in...";

  const result = await signIn(email, password);

  if (result.success) {
    window.location.href = "index.html";
  } else {
    document.getElementById("login-error").textContent = result.error;
    submitBtn.disabled = false;
    submitBtn.textContent = "Login";
  }
}

async function handleSignup(event) {
  event.preventDefault();

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;
  const submitBtn = event.target.querySelector('button[type="submit"]');

  // Validate name
  if (name.length < 2) {
    document.getElementById("signup-error").textContent = "Name must be at least 2 characters";
    return;
  }

  // Check password match
  if (password !== confirm) {
    document.getElementById("signup-error").textContent = "Passwords do not match";
    return;
  }

  // Disable button while processing
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  const result = await signUp(email, password, name);

  if (result.success) {
    window.location.href = "index.html";
  } else {
    document.getElementById("signup-error").textContent = result.error;
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
}
