(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyDV1V5EsL2WAVwC_IO2OB9_OjGHqEUZlRY",
    authDomain: "student-id-90c40.firebaseapp.com",
    projectId: "student-id-90c40",
    storageBucket: "student-id-90c40.firebasestorage.app",
    messagingSenderId: "530724046561",
    appId: "1:530724046561:web:ddafe2a49a08b610ed99a0"
  };

  const hasPlaceholder = Object.values(firebaseConfig).some((value) =>
    typeof value === "string" && value.startsWith("YOUR_")
  );

  let db = null;
  let auth = null;

  function init() {
    if (hasPlaceholder) {
      console.warn("Firebase config is not set. Update js/firebase-service.js with your project values.");
      return false;
    }
    if (!window.firebase || !window.firebase.firestore) {
      console.error("Firebase SDK is not loaded.");
      return false;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    db = firebase.firestore();
    if (firebase.auth) {
      auth = firebase.auth();
    }
    return true;
  }

  function isReady() {
    return Boolean(db);
  }

  function isAuthReady() {
    return Boolean(auth);
  }

  function getCurrentUser() {
    return auth ? auth.currentUser : null;
  }

  function onAuthStateChanged(callback) {
    if (!auth) {
      callback(null);
      return () => {};
    }
    return auth.onAuthStateChanged(callback);
  }

  async function signInWithGoogle() {
    if (!auth) {
      throw new Error("Firebase Auth is not available.");
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider);
  }

  async function signOut() {
    if (!auth) {
      return;
    }
    return auth.signOut();
  }

  async function submitResponse(data) {
    if (!db && !init()) {
      throw new Error("Firebase is not configured.");
    }

    const payload = {
      ...data,
      submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userAgent: navigator.userAgent
    };

    return db.collection("responses").add(payload);
  }

  async function fetchResponses() {
    if (!db && !init()) {
      throw new Error("Firebase is not configured.");
    }

    const snapshot = await db.collection("responses").orderBy("submittedAt", "desc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async function deleteResponse(id) {
    if (!db && !init()) {
      throw new Error("Firebase is not configured.");
    }
    if (!id) {
      throw new Error("Missing response id.");
    }
    return db.collection("responses").doc(id).delete();
  }

  window.FirebaseService = {
    init,
    isReady,
    isAuthReady,
    getCurrentUser,
    onAuthStateChanged,
    signInWithGoogle,
    signOut,
    submitResponse,
    fetchResponses,
    deleteResponse
  };

  init();
})();
