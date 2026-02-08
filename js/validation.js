(function () {
  function clearErrors(scope) {
    scope.querySelectorAll(".error-message").forEach((el) => el.remove());
    scope.querySelectorAll("[aria-invalid='true']").forEach((el) => el.removeAttribute("aria-invalid"));
  }

  function showError(field, message) {
    field.setAttribute("aria-invalid", "true");
    const error = document.createElement("p");
    error.className = "error-message";
    error.textContent = message;
    if (field.parentElement) {
      field.parentElement.appendChild(error);
    }
  }

  function isRadioGroupValid(groupName, scope) {
    const radios = Array.from(scope.querySelectorAll(`input[type="radio"][name="${groupName}"]`));
    return radios.some((radio) => radio.checked);
  }

  function validateFields(scope) {
    const requiredFields = Array.from(scope.querySelectorAll("[data-required='true'], [required]"));
    const checkedRadioNames = new Set();
    let firstInvalid = null;

    requiredFields.forEach((field) => {
      if (field.type === "radio") {
        if (checkedRadioNames.has(field.name)) {
          return;
        }
        checkedRadioNames.add(field.name);
        if (!isRadioGroupValid(field.name, scope)) {
          if (!firstInvalid) {
            firstInvalid = field;
          }
          showError(field.closest(".rating") || field, "Please select a rating.");
        }
        return;
      }

      const value = field.value ? field.value.trim() : "";
      if (!value) {
        if (!firstInvalid) {
          firstInvalid = field;
        }
        showError(field, "This field is required.");
      }
    });

    return { valid: !firstInvalid, firstInvalid };
  }

  function validateForm(form) {
    clearErrors(form);
    return validateFields(form);
  }

  function validateSection(section) {
    clearErrors(section);
    return validateFields(section);
  }

  window.Validation = {
    validateForm,
    validateSection,
    clearErrors
  };
})();
