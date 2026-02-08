(function () {
  const loadButton = document.getElementById("loadResponses");
  const downloadCsvButton = document.getElementById("downloadCsv");
  const downloadJsonButton = document.getElementById("downloadJson");
  const previewTable = document.getElementById("previewTable");
  const statusMessage = document.getElementById("statusMessage");
  const signInBtn = document.getElementById("signInBtn");
  const signOutBtn = document.getElementById("signOutBtn");
  const authStatus = document.getElementById("authStatus");
  const statsGrid = document.getElementById("statsGrid");
  const classStats = document.getElementById("classStats");
  const favoriteStats = document.getElementById("favoriteStats");
  const hobbyStats = document.getElementById("hobbyStats");
  const ratingStats = document.getElementById("ratingStats");
  const lessonStats = document.getElementById("lessonStats");
  const classFilters = document.getElementById("classFilters");

  const allowedEmails = ["paola.fatigato@gmail.com"];

  let responses = [];
  let selectedClasses = new Set();

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

  const excludedKeys = new Set(["id", "submittedAt", "timezone", "userAgent", "__id"]);

  const subjectRatings = [
    { key: "rateEnglish", label: "English" },
    { key: "rateMath", label: "Math" },
    { key: "rateScience", label: "Science" },
    { key: "rateItalian", label: "Italian" },
    { key: "rateLiterature", label: "Literature" },
    { key: "rateArt", label: "Art" },
    { key: "rateMusic", label: "Music" },
    { key: "rateTheater", label: "Theater" },
    { key: "ratePE", label: "Physical Education" },
    { key: "rateTechnology", label: "Technology" },
    { key: "rateGeography", label: "Geography" },
    { key: "rateHistory", label: "History" },
    { key: "rateInformatics", label: "Informatics" },
    { key: "rateDance", label: "Dance" },
    { key: "rateCrafts", label: "Crafts" }
  ];

  const lessonRatings = [
    { key: "lessonListening", label: "Listening" },
    { key: "lessonAlone", label: "Working alone" },
    { key: "lessonPairs", label: "Working in pairs" },
    { key: "lessonGroups", label: "Working in groups" },
    { key: "lessonVideos", label: "Videos" },
    { key: "lessonMoving", label: "Moving activities" },
    { key: "lessonSpeaking", label: "Speaking" },
    { key: "lessonOral", label: "Oral tasks" },
    { key: "lessonGames", label: "Games" },
    { key: "lessonWritten", label: "Written tasks" }
  ];

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
      Object.keys(row).forEach((key) => {
        if (!excludedKeys.has(key) && !key.startsWith("__")) {
          columnSet.add(key);
        }
      });
    });
    const columns = Array.from(columnSet);
    const ordered = preferredColumnOrder.filter((key) => columnSet.has(key));
    const extras = columns.filter((key) => !preferredColumnOrder.includes(key));
    return [...ordered, ...extras];
  }

  function normalizeResponse(row) {
    const normalized = {};
    if (row.id) {
      normalized.__id = row.id;
    }
    Object.keys(row).forEach((key) => {
      if (excludedKeys.has(key)) {
        return;
      }
      normalized[key] = row[key];
    });
    return normalized;
  }

  function parseNumeric(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const numeric = parseFloat(value.replace(",", "."));
      return Number.isFinite(numeric) ? numeric : null;
    }
    return null;
  }

  function averageForField(data, key) {
    const values = data
      .map((row) => parseNumeric(row[key]))
      .filter((value) => Number.isFinite(value));
    if (!values.length) {
      return { average: null, count: 0 };
    }
    const total = values.reduce((sum, value) => sum + value, 0);
    return { average: total / values.length, count: values.length };
  }

  function countByField(data, key) {
    return data.reduce((acc, row) => {
      const raw = row[key];
      if (!raw) {
        return acc;
      }
      const value = String(raw).trim();
      if (!value) {
        return acc;
      }
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  function getClassValue(row) {
    const direct = row.className ?? row.class ?? row.classe ?? row.classroom ?? row.classRoom;
    if (direct) {
      return String(direct).trim().toUpperCase();
    }
    const keys = Object.keys(row || {}).filter((key) => /class|classe/i.test(key));
    for (const key of keys) {
      const value = row[key];
      if (value) {
        return String(value).trim().toUpperCase();
      }
    }
    return "";
  }

  function renderStatCards(cards) {
    if (!statsGrid) {
      return;
    }
    statsGrid.innerHTML = "";
    if (!cards.length) {
      statsGrid.innerHTML = '<p class="helper">Load responses to view statistics.</p>';
      return;
    }
    cards.forEach((card) => {
      const wrapper = document.createElement("div");
      wrapper.className = "stat-card";
      const value = document.createElement("div");
      value.className = "stat-value";
      value.textContent = card.value;
      const label = document.createElement("div");
      label.className = "stat-label";
      label.textContent = card.label;
      wrapper.appendChild(value);
      wrapper.appendChild(label);
      statsGrid.appendChild(wrapper);
    });
  }

  function renderCountList(container, counts, total, emptyMessage) {
    if (!container) {
      return;
    }
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    container.innerHTML = "";
    if (!entries.length) {
      container.innerHTML = `<p class="helper">${emptyMessage}</p>`;
      return;
    }
    entries.forEach(([label, value]) => {
      const row = document.createElement("div");
      row.className = "stat-row";

      const name = document.createElement("span");
      name.className = "stat-name";
      name.textContent = label;

      const bar = document.createElement("div");
      bar.className = "stat-bar";
      const barFill = document.createElement("span");
      const width = total ? (value / total) * 100 : 0;
      barFill.style.width = `${width.toFixed(0)}%`;
      bar.appendChild(barFill);

      const count = document.createElement("span");
      count.className = "stat-count";
      count.textContent = String(value);

      row.appendChild(name);
      row.appendChild(bar);
      row.appendChild(count);
      container.appendChild(row);
    });
  }

  function renderAverageTable(table, items, data) {
    if (!table) {
      return;
    }
    table.innerHTML = "";
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["Item", "Avg", "Responses"].forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const ranked = items
      .map((item) => ({
        item,
        stats: averageForField(data, item.key)
      }))
      .sort((a, b) => {
        const aValue = a.stats.average ?? -1;
        const bValue = b.stats.average ?? -1;
        return bValue - aValue;
      });

    ranked.forEach(({ item, stats }) => {
      const tr = document.createElement("tr");

      const labelCell = document.createElement("td");
      labelCell.textContent = item.label;

      const avgCell = document.createElement("td");
      if (stats.average === null) {
        avgCell.textContent = "—";
      } else {
        const rounded = Math.round(stats.average * 2) / 2;
        const dots = document.createElement("span");
        dots.className = "rating-dots";
        dots.setAttribute("aria-label", `Average ${rounded} out of 5`);
        const fullDots = Math.floor(rounded);
        const hasHalf = rounded - fullDots >= 0.5;
        for (let i = 0; i < 5; i += 1) {
          const dot = document.createElement("span");
          dot.className = "dot";
          if (i < fullDots) {
            dot.classList.add("filled");
          } else if (i === fullDots && hasHalf) {
            dot.classList.add("half");
          }
          dots.appendChild(dot);
        }

        const number = document.createElement("span");
        number.className = "rating-value";
        number.textContent = stats.average.toFixed(2);

        const wrapper = document.createElement("span");
        wrapper.className = "rating-display";
        wrapper.appendChild(number);
        wrapper.appendChild(dots);
        avgCell.appendChild(wrapper);
      }

      const countCell = document.createElement("td");
      countCell.textContent = stats.count ? String(stats.count) : "—";

      tr.appendChild(labelCell);
      tr.appendChild(avgCell);
      tr.appendChild(countCell);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  function renderStats(data) {
    if (!data || !data.length) {
      renderStatCards([]);
      renderCountList(classStats, {}, 0, "No class data yet.");
      renderCountList(favoriteStats, {}, 0, "No favorite subjects yet.");
      renderCountList(hobbyStats, {}, 0, "No hobbies yet.");
      renderAverageTable(ratingStats, subjectRatings, []);
      renderAverageTable(lessonStats, lessonRatings, []);
      return;
    }

    const classCounts = data.reduce((acc, row) => {
      const value = getClassValue(row);
      if (!value) {
        return acc;
      }
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
    const favoriteCounts = countByField(data, "favoriteSubject");
    const hobbyCounts = data.reduce((acc, row) => {
      const keys = Object.keys(row || {}).filter((key) => /^hobbyName_/i.test(key));
      keys.forEach((key) => {
        const raw = row[key];
        if (!raw) {
          return;
        }
        const value = String(raw).trim().toLowerCase();
        if (!value) {
          return;
        }
        acc[value] = (acc[value] || 0) + 1;
      });
      return acc;
    }, {});
    const screenStats = averageForField(data, "screenTime");
    const sleepStats = averageForField(data, "sleepHours");
    const englishStats = averageForField(data, "englishConfidence");

    renderStatCards([
      { label: "Total responses", value: String(data.length) },
      { label: "Classes represented", value: String(Object.keys(classCounts).length) },
      {
        label: "Avg screen time",
        value: screenStats.average === null ? "—" : `${screenStats.average.toFixed(1)} h/day`
      },
      {
        label: "Avg sleep",
        value: sleepStats.average === null ? "—" : `${sleepStats.average.toFixed(1)} h/night`
      },
      {
        label: "Avg English confidence",
        value: englishStats.average === null ? "—" : englishStats.average.toFixed(2)
      }
    ]);

    renderCountList(classStats, classCounts, data.length, "No class data yet.");
    renderCountList(favoriteStats, favoriteCounts, data.length, "No favorite subjects yet.");
    renderCountList(hobbyStats, hobbyCounts, data.length, "No hobbies yet.");
    renderAverageTable(ratingStats, subjectRatings, data);
    renderAverageTable(lessonStats, lessonRatings, data);
  }

  function getAvailableClasses(data) {
    const classes = data
      .map((row) => getClassValue(row))
      .filter((value) => value);
    return Array.from(new Set(classes)).sort();
  }

  function renderClassFilters(classes) {
    if (!classFilters) {
      return;
    }
    classFilters.innerHTML = "";
    if (!classes.length) {
      classFilters.innerHTML = '<p class="helper">No class data yet.</p>';
      return;
    }

    const allButton = document.createElement("button");
    allButton.type = "button";
    allButton.className = "choice-chip filter-chip";
    allButton.textContent = "All";
    allButton.setAttribute("data-filter", "all");
    const isAllSelected = selectedClasses.size === 0 || selectedClasses.size === classes.length;
    allButton.classList.toggle("is-selected", isAllSelected);
    allButton.addEventListener("click", () => {
      selectedClasses = new Set(classes);
      updateFilteredStats();
    });
    classFilters.appendChild(allButton);

    classes.forEach((className) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-chip filter-chip";
      button.textContent = className;
      button.classList.toggle("is-selected", selectedClasses.has(className));
      button.addEventListener("click", () => {
        if (selectedClasses.has(className)) {
          selectedClasses.delete(className);
        } else {
          selectedClasses.add(className);
        }
        updateFilteredStats();
      });
      classFilters.appendChild(button);
    });
  }

  function applyClassFilter(data) {
    if (!selectedClasses.size) {
      return data;
    }
    return data.filter((row) => selectedClasses.has(getClassValue(row)));
  }

  function updateFilteredStats() {
    const availableClasses = getAvailableClasses(responses);
    if (!selectedClasses.size && availableClasses.length) {
      selectedClasses = new Set(availableClasses);
    }
    renderClassFilters(availableClasses);
    const filtered = applyClassFilter(responses);
    renderStats(filtered);
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
    const actionHeader = document.createElement("th");
    actionHeader.textContent = "Actions";
    actionHeader.style.textAlign = "left";
    actionHeader.style.padding = "8px";
    actionHeader.style.borderBottom = "1px solid #ddd";
    headerRow.appendChild(actionHeader);
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
      const actionCell = document.createElement("td");
      actionCell.style.padding = "8px";
      actionCell.style.borderBottom = "1px solid #f0f0f0";
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "btn btn-outline btn-danger";
      deleteButton.textContent = "Delete";
      deleteButton.disabled = !row.__id;
      deleteButton.addEventListener("click", () => handleDelete(row));
      actionCell.appendChild(deleteButton);
      tr.appendChild(actionCell);
      tbody.appendChild(tr);
    });
    previewTable.appendChild(tbody);
  }

  async function handleDelete(row) {
    const user = window.FirebaseService.getCurrentUser();
    if (!user) {
      setStatus("Please sign in first.");
      return;
    }
    if (allowedEmails.length > 0 && !allowedEmails.includes(user.email)) {
      setStatus("This account is not allowed.");
      return;
    }
    if (!row.__id) {
      setStatus("Missing response id.");
      return;
    }
    const label = [row.firstName, row.lastName].filter(Boolean).join(" ") || "this response";
    const confirmed = window.confirm(`Delete ${label}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    try {
      setStatus("Deleting response...");
      await window.FirebaseService.deleteResponse(row.__id);
      responses = responses.filter((item) => item.__id !== row.__id);
      setStatus("Response deleted.");
      renderPreview(responses);
      const availableClasses = getAvailableClasses(responses);
      selectedClasses = new Set(availableClasses);
      updateFilteredStats();
      downloadCsvButton.disabled = responses.length === 0;
      downloadJsonButton.disabled = responses.length === 0;
    } catch (error) {
      console.error(error);
      setStatus("Unable to delete response. Check Firestore Rules for delete access.");
    }
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
      renderStats(responses);
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

  renderStats([]);
  renderClassFilters([]);

  loadButton.addEventListener("click", loadResponses);
  downloadCsvButton.addEventListener("click", downloadCsv);
  downloadJsonButton.addEventListener("click", downloadJson);
})();
