(function () {
  const STORAGE_KEY = "studentQuestionnaireData";

  function serializeForm(form) {
    const data = {};
    const elements = Array.from(form.elements).filter((el) => el.name);

    elements.forEach((el) => {
      if (el.type === "radio") {
        if (!data[el.name]) {
          data[el.name] = "";
        }
        if (el.checked) {
          data[el.name] = el.value;
        }
        return;
      }

      if (el.type === "checkbox") {
        if (!data[el.name]) {
          data[el.name] = [];
        }
        if (el.checked) {
          data[el.name].push(el.value);
        }
        return;
      }

      data[el.name] = el.value;
    });

    return data;
  }

  function applyFormData(form, data) {
    const elements = Array.from(form.elements).filter((el) => el.name);
    elements.forEach((el) => {
      if (!(el.name in data)) {
        return;
      }
      if (el.type === "radio") {
        el.checked = data[el.name] === el.value;
        return;
      }
      if (el.type === "checkbox") {
        el.checked = Array.isArray(data[el.name]) && data[el.name].includes(el.value);
        return;
      }
      el.value = data[el.name];
    });
  }

  function saveFormData(form) {
    const data = serializeForm(form);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      savedAt: new Date().toISOString(),
      data
    }));
    return data;
  }

  function loadFormData(form) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data) {
        applyFormData(form, parsed.data);
        return parsed.data;
      }
    } catch (error) {
      console.warn("Unable to load saved data", error);
    }
    return null;
  }

  function clearFormData() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function startAutoSave(form, onSave) {
    const handler = () => {
      const data = saveFormData(form);
      if (onSave) {
        onSave(data);
      }
    };

    form.addEventListener("blur", handler, true);
    form.addEventListener("change", handler);

    const interval = setInterval(handler, 30000);
    return () => clearInterval(interval);
  }

  window.StorageManager = {
    saveFormData,
    loadFormData,
    clearFormData,
    startAutoSave,
    serializeForm
  };
})();
