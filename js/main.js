  // --- Languages at home logic ---
  // --- Languages at home logic (chip style) ---
  const italianBtn = document.getElementById('italianBtn');
  const otherLanguages = document.getElementById('otherLanguages');
  const otherLanguageInput = document.getElementById('otherLanguageInput');
  const languagesHomeHidden = document.getElementById('languagesHome');
  const selectedLanguagesDiv = document.getElementById('selectedLanguages');

  let selectedLangs = [];

  function updateLanguagesHomeField() {
    const selected = [...selectedLangs];
    if (italianBtn && italianBtn.getAttribute('aria-pressed') === 'true') {
      if (!selected.includes('Italian')) selected.unshift('Italian');
    } else {
      const idx = selected.indexOf('Italian');
      if (idx !== -1) selected.splice(idx, 1);
    }
    if (languagesHomeHidden) {
      languagesHomeHidden.value = selected.join(', ');
    }
    renderSelectedLanguages(selected);
  }

  function renderSelectedLanguages(selected) {
    if (!selectedLanguagesDiv) return;
    selectedLanguagesDiv.innerHTML = '';
    selected.filter(l => l !== 'Italian').forEach(lang => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-chip lang-chip is-selected';
      btn.textContent = lang;
      btn.onclick = () => {
        // Remove from selectedLangs
        selectedLangs = selectedLangs.filter(l => l !== lang);
        updateLanguagesHomeField();
      };
      selectedLanguagesDiv.appendChild(btn);
    });
  }

  if (italianBtn) {
    italianBtn.addEventListener('click', () => {
      const pressed = italianBtn.getAttribute('aria-pressed') === 'true';
      italianBtn.setAttribute('aria-pressed', pressed ? 'false' : 'true');
      italianBtn.classList.toggle('is-selected', !pressed);
      updateLanguagesHomeField();
    });
  }

  if (otherLanguages) {
    otherLanguages.addEventListener('change', () => {
      const val = otherLanguages.value;
      if (val === 'other') {
        otherLanguageInput.style.display = 'block';
        otherLanguageInput.focus();
      } else {
        otherLanguageInput.style.display = 'none';
        otherLanguageInput.value = '';
        if (val) {
          const langName = val.charAt(0).toUpperCase() + val.slice(1);
          if (!selectedLangs.includes(langName)) {
            selectedLangs.push(langName);
          }
        }
      }
      updateLanguagesHomeField();
    });
  }

  if (otherLanguageInput) {
    otherLanguageInput.addEventListener('input', () => {
      // Aggiorna o aggiungi la lingua custom
      selectedLangs = selectedLangs.filter(l => l !== 'Other' && l !== otherLanguageInput.dataset.lastValue);
      if (otherLanguageInput.value.trim()) {
        selectedLangs.push(otherLanguageInput.value.trim());
        otherLanguageInput.dataset.lastValue = otherLanguageInput.value.trim();
      } else {
        delete otherLanguageInput.dataset.lastValue;
      }
      updateLanguagesHomeField();
    });
  }

  // Inizializza Italian come non selezionato
  italianBtn?.setAttribute('aria-pressed', 'false');
  italianBtn?.classList.remove('is-selected');
  updateLanguagesHomeField();
(function () {
  const form = document.getElementById("studentForm");
  const panels = Array.from(document.querySelectorAll(".panel"));
  const stepperItems = Array.from(document.querySelectorAll(".step"));
  const progressFill = document.getElementById("progressFill");
  const progressPercent = document.getElementById("progressPercent");
  const progressBar = document.querySelector(".progress-bar");
  const saveIndicator = document.getElementById("saveIndicator");
  const screenTime = document.getElementById("screenTime");
  const screenValue = document.getElementById("screenValue");
  const studyOtherRadio = document.getElementById("studyOtherRadio");
  const studyOther = document.getElementById("studyOther");
  const bedTime = document.getElementById("bedTime");
  const wakeTime = document.getElementById("wakeTime");
  const sleepHours = document.getElementById("sleepHours");
  const hobbyInput = document.getElementById("hobbyInput");
  const hobbyList = document.getElementById("hobbyList");
  const hobbySummary = document.getElementById("hobbySummary");
  const favoriteSubject = document.getElementById("favoriteSubject");
  const favoriteSubjectReason = document.getElementById("favoriteSubjectReason");
  const englishGoal = document.getElementById("englishGoal");
  const englishFocus = document.getElementById("englishFocus");
  const englishFocusGroup = document.getElementById("englishFocusGroup");
  const classGroup = document.getElementById("classGroup");
  const classNameInput = document.getElementById("className");
  const livesWithHidden = document.getElementById("livesWith");
  const livesWithCheckboxes = Array.from(document.querySelectorAll("[data-lives-with]"));
  const familyDetails = document.getElementById("familyDetails");
  const familyPersonSections = Array.from(document.querySelectorAll("[data-family-person]"));
  const familyCountInputs = Array.from(document.querySelectorAll("[data-person-count]"));
  const printPdfContainer = document.getElementById("printPdfContainer");
  let printPdf = null;
  const app = document.querySelector(".app");
  const accentClasses = ["accent-mint", "accent-flame", "accent-plum", "accent-gold"];
  const hobbyPlaceholderSets = [
    "reading, playing videogames...",
    "drawing, dancing...",
    "playing football, swimming...",
    "singing, acting...",
    "cooking, biking...",
    "coding, photography..."
  ];
  const favoriteSubjectPlaceholders = {
    English: "I like traveling and ...",
    Crafts: "I always make bracelets and...",
    Math: "I like numbers and...",
    Science: "I like experiments and...",
    Italian: "I enjoy stories and...",
    Literature: "I love reading and...",
    Art: "I like drawing and...",
    Music: "I like singing and...",
    Theater: "I like acting and...",
    "P.E.": "I like sports and...",
    Technology: "I like building things and...",
    Geography: "I like maps and...",
    History: "I like old stories and...",
    Informatics: "I like coding and...",
    Dance: "I like moving and..."
  };

  let currentStep = 0;
  let hobbyCount = 0;
  let hobbyPlaceholderIndex = 0;

  function showStep(index) {
    if (index < 0 || index >= panels.length) {
      return;
    }
    panels.forEach((panel, i) => {
      panel.classList.toggle("active", i === index);
    });
    if (app) {
      app.classList.remove(...accentClasses);
      const panelAccent = accentClasses.find((accent) => panels[index].classList.contains(accent));
      if (panelAccent) {
        app.classList.add(panelAccent);
      }
    }
    stepperItems.forEach((step, i) => {
      step.classList.toggle("active", i === index);
      const button = step.querySelector(".step-button");
      if (button) {
        if (i === index) {
          button.setAttribute("aria-current", "step");
        } else {
          button.removeAttribute("aria-current");
        }
      }
    });
    currentStep = index;
    panels[index].scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function isFieldComplete(field, scope) {
    if (field.type === "radio") {
      return Array.from(scope.querySelectorAll(`input[type="radio"][name="${field.name}"]`))
        .some((radio) => radio.checked);
    }
    if (field.type === "checkbox") {
      return field.checked;
    }
    return field.value && field.value.trim().length > 0;
  }

  function updateProgress() {
    const requiredFields = Array.from(form.querySelectorAll("[data-required='true'], [required]"));
    const handledRadioNames = new Set();
    let completed = 0;

    requiredFields.forEach((field) => {
      if (field.type === "radio") {
        if (handledRadioNames.has(field.name)) {
          return;
        }
        handledRadioNames.add(field.name);
        if (isFieldComplete(field, form)) {
          completed += 1;
        }
        return;
      }
      if (isFieldComplete(field, form)) {
        completed += 1;
      }
    });

    const total = handledRadioNames.size + requiredFields.filter((field) => field.type !== "radio").length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    progressFill.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    progressBar.setAttribute("aria-valuenow", `${percent}`);

    panels.forEach((panel, index) => {
      const sectionRequired = Array.from(panel.querySelectorAll("[data-required='true'], [required]"));
      const sectionRadioNames = new Set();
      let sectionCompleted = 0;

      sectionRequired.forEach((field) => {
        if (field.type === "radio") {
          if (sectionRadioNames.has(field.name)) {
            return;
          }
          sectionRadioNames.add(field.name);
          if (isFieldComplete(field, panel)) {
            sectionCompleted += 1;
          }
          return;
        }
        if (isFieldComplete(field, panel)) {
          sectionCompleted += 1;
        }
      });

      const sectionTotal = sectionRadioNames.size + sectionRequired.filter((field) => field.type !== "radio").length;
      const isComplete = sectionTotal > 0 && sectionCompleted === sectionTotal;
      stepperItems[index].classList.toggle("complete", isComplete);
    });
  }

  function updateSaveIndicator(timestamp) {
    saveIndicator.textContent = timestamp ? `Progress saved at ${timestamp}` : "Progress not saved yet.";
  }

  function updateScreenTime() {
    if (!screenTime || !screenValue) {
      return;
    }
    screenValue.textContent = screenTime.value;
  }

  function toggleStudyOther() {
    if (!studyOther || !studyOtherRadio) {
      return;
    }
    studyOther.disabled = !studyOtherRadio.checked;
    if (!studyOtherRadio.checked) {
      studyOther.value = "";
    }
  }

  function updateLivesWithValue() {
    if (!livesWithHidden) {
      return;
    }
    const selected = livesWithCheckboxes.filter((box) => box.checked).map((box) => box.value);
    livesWithHidden.value = selected.join(", ");
  }

  function setConditionalRequired(input, isRequired) {
    if (!input) {
      return;
    }
    if (isRequired) {
      input.setAttribute("required", "");
      input.dataset.required = "true";
    } else {
      input.removeAttribute("required");
      input.removeAttribute("data-required");
    }
  }

  function renderNameRows(personKey, count, data = {}) {
    const list = document.getElementById(`${personKey}List`);
    if (!list) {
      return;
    }
    const safeCount = Math.max(1, Math.min(10, Number(count) || 1));
    list.innerHTML = "";

    const labelBase = personKey.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

    for (let i = 1; i <= safeCount; i += 1) {
      const field = document.createElement("div");
      field.className = "family-field";

      const label = document.createElement("label");
      label.setAttribute("for", `${personKey}Name${i}`);
      label.textContent = `${labelBase}'s name #${i}`;

      const input = document.createElement("input");
      input.type = "text";
      input.id = `${personKey}Name${i}`;
      input.name = `${personKey}Name${i}`;
      input.autocomplete = "name";
      setConditionalRequired(input, true);

      if (data[input.name]) {
        input.value = data[input.name];
      }

      field.appendChild(label);
      field.appendChild(input);
      list.appendChild(field);
    }
  }
  function syncFamilySection(data = {}) {
    updateLivesWithValue();
    livesWithCheckboxes.forEach((box) => {
      const chip = box.closest(".choice-chip");
      if (chip) {
        chip.classList.toggle("is-selected", box.checked);
      }
    });
    if (familyDetails) {
      const anySelected = livesWithCheckboxes.some((box) => box.checked);
      familyDetails.hidden = !anySelected;
    }
    familyPersonSections.forEach((section) => {
      const key = section.dataset.familyPerson;
      const checkbox = livesWithCheckboxes.find((box) => box.dataset.personTarget === key);
      const isActive = Boolean(checkbox && checkbox.checked);
      section.hidden = !isActive;
      const inputs = Array.from(section.querySelectorAll("input, select, textarea"));
      inputs.forEach((input) => {
        setConditionalRequired(input, isActive);
        if (!isActive) {
          input.value = "";
        }
      });
      if (isActive) {
        const countInput = section.querySelector("[data-person-count]");
        if (countInput) {
          if (!countInput.value) {
            countInput.value = "1";
          }
          renderNameRows(key, countInput.value, data);
        }
      } else {
        const list = document.getElementById(`${key}List`);
        if (list) {
          list.innerHTML = "";
        }
      }
    });
  }

  function calculateSleepHours() {
    if (!bedTime.value || !wakeTime.value) {
      sleepHours.value = "";
      return;
    }
    const [bedH, bedM] = bedTime.value.split(":").map(Number);
    const [wakeH, wakeM] = wakeTime.value.split(":").map(Number);

    let bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;

    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60;
    }
    const diff = wakeMinutes - bedMinutes;
    const hours = (diff / 60).toFixed(1);
    sleepHours.value = `${hours} hours`;
  }

  function updateCounters() {
    const textareas = Array.from(form.querySelectorAll("textarea[data-maxlen]"));
    textareas.forEach((textarea) => {
      const max = parseInt(textarea.dataset.maxlen, 10);
      const counter = form.querySelector(`[data-counter-for='${textarea.id}']`);
      const guidance = form.querySelector(`[data-guidance-for='${textarea.id}']`);
      if (!counter || !max) {
        return;
      }
      const length = textarea.value.length;
      counter.textContent = `${length}/${max}`;
      if (guidance) {
        guidance.textContent = length < 20 ? "Tell us more!" : "Great detail!";
      }
    });
  }

  function setupRatingAria() {
    const ratings = Array.from(form.querySelectorAll(".rating"));
    ratings.forEach((rating) => {
      const inputs = Array.from(rating.querySelectorAll("input[type='radio']"));
      inputs.forEach((input) => {
        if (!input.getAttribute("aria-label")) {
          input.setAttribute("aria-label", `Rating ${input.value}`);
        }
      });
    });
  }

  function updateRatingGroup(rating) {
    if (!rating) {
      return;
    }
    const inputs = Array.from(rating.querySelectorAll("input[type='radio']"));
    const checkedIndex = inputs.findIndex((input) => input.checked);
    inputs.forEach((input, index) => {
      const shouldFill = checkedIndex >= 0 && index <= checkedIndex;
      input.classList.toggle("is-filled", shouldFill);
    });
  }

  function updateAllRatings() {
    const ratings = Array.from(form.querySelectorAll(".rating"));
    ratings.forEach((rating) => updateRatingGroup(rating));
  }

  function updateHobbySummary() {
    if (!hobbySummary || !hobbyList) {
      return;
    }
    const labels = Array.from(hobbyList.querySelectorAll(".hobby-rating-label"))
      .map((label) => label.textContent.trim())
      .filter(Boolean);
    hobbySummary.value = labels.join(", ");
  }

  function updateFavoriteSubjectPlaceholder() {
    if (!favoriteSubject || !favoriteSubjectReason) {
      return;
    }
    const selected = favoriteSubject.value;
    favoriteSubjectReason.placeholder = favoriteSubjectPlaceholders[selected]
      || "Because...";
  }

  function updateEnglishGoalPlaceholder(skill) {
    if (!englishGoal) {
      return;
    }
    const label = skill || "Speaking";
    englishGoal.placeholder = `${label} because I want to ...`;
  }

  function setEnglishFocus(skill) {
    if (!englishFocusGroup || !englishFocus) {
      return;
    }
    const buttons = Array.from(englishFocusGroup.querySelectorAll("[data-english-skill]"));
    buttons.forEach((button) => {
      const isSelected = button.dataset.englishSkill === skill;
      button.classList.toggle("is-selected", isSelected);
      if (isSelected) {
        button.setAttribute("aria-pressed", "true");
      } else {
        button.setAttribute("aria-pressed", "false");
      }
    });
    englishFocus.value = skill || "";
    updateEnglishGoalPlaceholder(skill);
  }

  function setClassSelection(value) {
    if (!classGroup || !classNameInput) {
      return;
    }
    const buttons = Array.from(classGroup.querySelectorAll("[data-class]"));
    buttons.forEach((button) => {
      const isSelected = button.dataset.class === value;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
    classNameInput.value = value || "";
  }

  function createHobbyRow(label, index = null, ratingValue = "") {
    if (!hobbyList) {
      return;
    }
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      return;
    }
    const hobbyIndex = Number.isInteger(index) ? index : hobbyCount + 1;
    hobbyCount = Math.max(hobbyCount, hobbyIndex);

    const row = document.createElement("div");
    row.className = "hobby-rating-row";

    const labelSpan = document.createElement("span");
    labelSpan.className = "hobby-rating-label";
    labelSpan.textContent = trimmedLabel;

    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = `hobbyName_${hobbyIndex}`;
    hiddenInput.value = trimmedLabel;

    const rating = document.createElement("div");
    rating.className = "rating";
    rating.dataset.ratingGroup = "";

    for (let i = 1; i <= 5; i += 1) {
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `hobbyRating_${hobbyIndex}`;
      input.value = String(i);
      input.setAttribute("aria-label", `Rating ${i}`);
      if (ratingValue && String(ratingValue) === String(i)) {
        input.checked = true;
      }
      rating.appendChild(input);
    }

    row.appendChild(labelSpan);
    row.appendChild(rating);
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "hobby-remove";
    removeButton.setAttribute("aria-label", `Remove ${trimmedLabel}`);
    removeButton.textContent = "×";
    row.appendChild(removeButton);
    row.appendChild(hiddenInput);
    hobbyList.appendChild(row);

    updateRatingGroup(rating);
    updateHobbySummary();
  }

  function addHobbyFromInput() {
    if (!hobbyInput) {
      return;
    }
    const value = hobbyInput.value.trim();
    if (!value) {
      return;
    }
    createHobbyRow(value);
    hobbyInput.value = "";
    if (hobbyPlaceholderSets.length > 0) {
      hobbyPlaceholderIndex = (hobbyPlaceholderIndex + 1) % hobbyPlaceholderSets.length;
      hobbyInput.placeholder = hobbyPlaceholderSets[hobbyPlaceholderIndex];
    }
    updateProgress();
  }

  function hydrateHobbyRatings(data = {}) {
    if (!data || !hobbyList) {
      return;
    }
    const entries = Object.keys(data)
      .filter((key) => key.startsWith("hobbyName_"))
      .map((key) => ({
        index: Number.parseInt(key.split("_")[1], 10),
        label: data[key]
      }))
      .filter((entry) => Number.isInteger(entry.index) && entry.label);

    entries.sort((a, b) => a.index - b.index);

    entries.forEach((entry) => {
      const ratingValue = data[`hobbyRating_${entry.index}`] || "";
      createHobbyRow(entry.label, entry.index, ratingValue);
    });

    updateHobbySummary();
  }

  const allowStepNavigationWithoutValidation = true;

  form.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }
    if (button.dataset.action === "next") {
      if (!allowStepNavigationWithoutValidation) {
        const result = window.Validation.validateSection(panels[currentStep]);
        if (!result.valid) {
          result.firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }
      showStep(currentStep + 1);
    }
    if (button.dataset.action === "prev") {
      showStep(currentStep - 1);
    }
  });

  stepperItems.forEach((item, index) => {
    item.addEventListener("click", () => showStep(index));
  });

  form.addEventListener("mousedown", (event) => {
    const input = event.target.closest(".panel[data-step='3'] .rating input[type='radio']");
    if (!input) {
      return;
    }
    if (input.checked) {
      input.dataset.wasChecked = "true";
    } else {
      delete input.dataset.wasChecked;
    }
  });

  form.addEventListener("click", (event) => {
    const input = event.target.closest(".panel[data-step='3'] .rating input[type='radio']");
    if (!input || input.dataset.wasChecked !== "true") {
      return;
    }
    input.checked = false;
    delete input.dataset.wasChecked;
    const rating = input.closest(".rating");
    updateRatingGroup(rating);
    updateProgress();
  });

  form.addEventListener("input", () => {
    updateProgress();
    updateCounters();
    updateLanguagesHomeField();
  });

  form.addEventListener("change", (event) => {
    if (event.target.matches(".rating input[type='radio']")) {
      updateRatingGroup(event.target.closest(".rating"));
    }
    if (event.target === favoriteSubject) {
      updateFavoriteSubjectPlaceholder();
    }
    if (event.target.matches("[data-lives-with]")) {
      syncFamilySection();
    }
    if (event.target.matches("[data-person-count]")) {
      const key = event.target.dataset.personCount;
      if (key) {
        renderNameRows(key, event.target.value);
      }
    }
    updateProgress();
    toggleStudyOther();
    calculateSleepHours();
  });

  englishFocusGroup?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-english-skill]");
    if (!button) {
      return;
    }
    setEnglishFocus(button.dataset.englishSkill);
    updateProgress();
  });

  classGroup?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-class]");
    if (!button) {
      return;
    }
    setClassSelection(button.dataset.class);
    updateProgress();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const result = await window.FormHandler.handleSubmit(form);
    if (result.ok) {
      saveIndicator.textContent = "Submitted! Your answers are saved.";
      // Mostra il pulsante Print/Save as PDF
      if (printPdfContainer) {
        printPdfContainer.style.display = "block";
        printPdf = document.getElementById("printPdf");
        if (printPdf) {
          printPdf.onclick = () => window.print();
        }
      }
    } else if (result.message) {
      saveIndicator.textContent = result.message;
      if (result.firstInvalid) {
        const panel = result.firstInvalid.closest(".panel");
        if (panel) {
          const index = panels.indexOf(panel);
          if (index >= 0) {
            showStep(index);
          }
        }
        result.firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });

  form.addEventListener("reset", () => {
    window.FormHandler.handleReset(form);
    syncFamilySection();
    // Deseleziona tutti i radio button nelle classi .rating
    const ratings = Array.from(form.querySelectorAll(".rating input[type='radio']"));
    ratings.forEach(radio => {
      radio.checked = false;
      radio.classList.remove("is-filled");
    });
    updateAllRatings();
    if (hobbyList) {
      hobbyList.innerHTML = "";
    }
    hobbyCount = 0;
    if (hobbySummary) {
      hobbySummary.value = "";
    }
    updateProgress();
    updateCounters();
    updateSaveIndicator();
    updateFavoriteSubjectPlaceholder();
    setEnglishFocus("");
  });

  // Il pulsante Print/Save as PDF viene gestito dopo il submit

  screenTime?.addEventListener("input", updateScreenTime);
  bedTime?.addEventListener("change", calculateSleepHours);
  wakeTime?.addEventListener("change", calculateSleepHours);
  studyOtherRadio?.addEventListener("change", toggleStudyOther);
  hobbyInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addHobbyFromInput();
    }
  });

  hobbyList?.addEventListener("click", (event) => {
    const button = event.target.closest(".hobby-remove");
    if (!button) {
      return;
    }
    const row = button.closest(".hobby-rating-row");
    if (row) {
      row.remove();
      updateHobbySummary();
      updateProgress();
    }
  });

  const savedData = window.StorageManager.loadFormData(form);
  if (savedData) {
    updateSaveIndicator("just now");
  }
  window.StorageManager.startAutoSave(form, () => updateSaveIndicator(new Date().toLocaleTimeString()));

  updateScreenTime();
  toggleStudyOther();
  calculateSleepHours();
  updateCounters();
  setupRatingAria();
  updateAllRatings();
  syncFamilySection(savedData || {});
  hydrateHobbyRatings(savedData || {});
  updateFavoriteSubjectPlaceholder();
  setEnglishFocus(savedData?.englishFocus || "");
  setClassSelection(savedData?.className || "");
  updateEnglishGoalPlaceholder(savedData?.englishFocus || "Speaking");
  updateProgress();
  showStep(0);
})();
