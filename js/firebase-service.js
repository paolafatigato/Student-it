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
    return true;
  }

  function isReady() {
    return Boolean(db);
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

  window.FirebaseService = {
    init,
    isReady,
    submitResponse
  };

  init();
})();
