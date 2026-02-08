(function () {
  const loadButton = document.getElementById("loadResponses");
  const downloadCsvButton = document.getElementById("downloadCsv");
  const downloadJsonButton = document.getElementById("downloadJson");
  const previewTable = document.getElementById("previewTable");
  const statusMessage = document.getElementById("statusMessage");
  const signInBtn = document.getElementById("signInBtn");
  const signOutBtn = document.getElementById("signOutBtn");
  const authStatus = document.getElementById("authStatus");

  const allowedEmails = ["paola.fatigato@gmail.com"];

  let responses = [];

  function setStatus(message) {
    statusMessage.textContent = message;
  }

  const preferredColumnOrder = [
    "firstName",
    "lastName",
    "preferredName",
    "livesWith",
    "languagesHome",
    "studyPlace",
    "studyOther",
    "screenTime",
    "studyHelper",
    "homeworkStart",
    "bedTime",
    "wakeTime",
    "sleepHours",
    "hobbySummary",
    "weekendLove",
    "goodAt1",
    "goodAt2",
    "goodAt3",
    "difficult1",
    "difficult2",
    "difficult3",
    "rateEnglish",
    "rateMath",
    "rateScience",
    "rateItalian",
    "rateLiterature",
    "rateArt",
    "rateMusic",
    "rateTheater",
    "ratePE",
    "rateTechnology",
    "rateGeography",
    "rateHistory",
    "rateInformatics",
    "rateDance",
    "rateCrafts",
    "favoriteSubject",
    "favoriteSubjectReason",
    "englishConfidence",
    "englishYears",
    "englishGoal",
    "englishWorry",
    "lessonListening",
    "lessonAlone",
    "lessonPairs",
    "lessonGroups",
    "lessonVideos",
    "lessonMoving",
    "lessonSpeaking",
    "lessonOral",
    "lessonGames",
    "lessonWritten",
    "bestLessons"
  ];

  const excludedKeys = new Set(["id", "submittedAt", "timezone", "userAgent"]);

  function flattenValue(value) {
    if (Array.isArray(value)) {
      return value.join(" | ");
    }
    if (value && typeof value === "object") {
      return JSON.stringify(value);
    }
    return value ?? "";
  }

  function buildColumns(data) {
    const columnSet = new Set();
    data.forEach((row) => {
      Object.keys(row).forEach((key) => columnSet.add(key));
    });
    const columns = Array.from(columnSet);
    const ordered = preferredColumnOrder.filter((key) => columnSet.has(key));
    const extras = columns.filter((key) => !preferredColumnOrder.includes(key));
    return [...ordered, ...extras];
  }

  function normalizeResponse(row) {
    const normalized = {};
    Object.keys(row).forEach((key) => {
      if (excludedKeys.has(key)) {
        return;
      }
      normalized[key] = row[key];
    });
    return normalized;
  }

  function toCsv(data) {
    const columns = buildColumns(data);
    const header = columns.join(",");

    const rows = data.map((row) => {
      return columns
        .map((col) => {
          const value = flattenValue(row[col]);
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",");
    });

    return [header, ...rows].join("\n");
  }

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function renderPreview(data) {
    previewTable.innerHTML = "";
    if (!data.length) {
      return;
    }
    const columns = buildColumns(data);
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    columns.forEach((col) => {
      const th = document.createElement("th");
      th.textContent = col;
      th.style.textAlign = "left";
      th.style.padding = "8px";
      th.style.borderBottom = "1px solid #ddd";
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    previewTable.appendChild(thead);

    const tbody = document.createElement("tbody");
    data.slice(0, 10).forEach((row) => {
      const tr = document.createElement("tr");
      columns.forEach((col) => {
        const td = document.createElement("td");
        td.textContent = String(flattenValue(row[col]));
        td.style.padding = "8px";
        td.style.borderBottom = "1px solid #f0f0f0";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    previewTable.appendChild(tbody);
  }

  async function loadResponses() {
    setStatus("Loading responses...");

    try {
      const user = window.FirebaseService.getCurrentUser();
      if (!user) {
        setStatus("Please sign in first.");
        return;
      }
      if (allowedEmails.length > 0 && !allowedEmails.includes(user.email)) {
        setStatus("This account is not allowed.");
        return;
      }

      const rawResponses = await window.FirebaseService.fetchResponses();
      responses = rawResponses.map(normalizeResponse);
      setStatus(`Loaded ${responses.length} responses.`);
      renderPreview(responses);
      downloadCsvButton.disabled = responses.length === 0;
      downloadJsonButton.disabled = responses.length === 0;
    } catch (error) {
      console.error(error);
      setStatus("Unable to load responses. Check Firestore Rules for read access.");
    }
  }

  function downloadCsv() {
    const csv = toCsv(responses);
    downloadFile(csv, "student-responses.csv", "text/csv");
  }

  function downloadJson() {
    const content = JSON.stringify(responses, null, 2);
    downloadFile(content, "student-responses.json", "application/json");
  }

  function updateAuthState(user) {
    if (!authStatus || !signInBtn || !signOutBtn) {
      return;
    }
    if (!user) {
      authStatus.textContent = "Not signed in.";
      signInBtn.disabled = false;
      signOutBtn.disabled = true;
      loadButton.disabled = true;
      return;
    }
    authStatus.textContent = `Signed in as ${user.email || user.uid}`;
    signInBtn.disabled = true;
    signOutBtn.disabled = false;
    const isAllowed = allowedEmails.length === 0 || allowedEmails.includes(user.email);
    loadButton.disabled = !isAllowed;
    if (!isAllowed) {
      setStatus("This account is not allowed.");
    }
  }

  signInBtn.addEventListener("click", async () => {
    try {
      await window.FirebaseService.signInWithGoogle();
    } catch (error) {
      console.error(error);
      setStatus("Sign-in failed. Check Firebase Auth settings.");
    }
  });

  signOutBtn.addEventListener("click", async () => {
    try {
      await window.FirebaseService.signOut();
    } catch (error) {
      console.error(error);
    }
  });

  if (window.FirebaseService && window.FirebaseService.onAuthStateChanged) {
    window.FirebaseService.onAuthStateChanged(updateAuthState);
  } else {
    setStatus("Firebase Auth is not available.");
  }

  loadButton.addEventListener("click", loadResponses);
  downloadCsvButton.addEventListener("click", downloadCsv);
  downloadJsonButton.addEventListener("click", downloadJson);
})();
