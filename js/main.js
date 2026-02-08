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
  const livesWithHidden = document.getElementById("livesWith");
  const livesWithCheckboxes = Array.from(document.querySelectorAll("[data-lives-with]"));
  const familyDetails = document.getElementById("familyDetails");
  const familyPersonSections = Array.from(document.querySelectorAll("[data-family-person]"));
  const familyCountInputs = Array.from(document.querySelectorAll("[data-person-count]"));
  const downloadJson = document.getElementById("downloadJson");
  const printPdf = document.getElementById("printPdf");
  const app = document.querySelector(".app");
  const accentClasses = ["accent-mint", "accent-flame", "accent-plum", "accent-gold"];

  let currentStep = 0;

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

  form.addEventListener("input", () => {
    updateProgress();
    updateCounters();
  });

  form.addEventListener("change", (event) => {
    if (event.target.matches(".rating input[type='radio']")) {
      updateRatingGroup(event.target.closest(".rating"));
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

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const result = await window.FormHandler.handleSubmit(form);
    if (result.ok) {
      saveIndicator.textContent = "Submitted! Your answers are saved.";
    } else if (result.message) {
      saveIndicator.textContent = result.message;
    }
  });

  form.addEventListener("reset", () => {
    window.FormHandler.handleReset(form);
    syncFamilySection();
    updateProgress();
    updateCounters();
    updateSaveIndicator();
  });

  if (downloadJson) {
    downloadJson.addEventListener("click", () => {
      const data = window.StorageManager.serializeForm(form);
      window.FormHandler.downloadJson(data);
    });
  }

  if (printPdf) {
    printPdf.addEventListener("click", () => window.print());
  }

  screenTime?.addEventListener("input", updateScreenTime);
  bedTime?.addEventListener("change", calculateSleepHours);
  wakeTime?.addEventListener("change", calculateSleepHours);
  studyOtherRadio?.addEventListener("change", toggleStudyOther);

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
  updateProgress();
  showStep(0);
})();
