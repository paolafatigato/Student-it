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

  function validateForm(form) {
    clearErrors(form);
    let firstInvalid = null;

    function addError(target, message) {
      if (!target) {
        return;
      }
      if (!firstInvalid) {
        firstInvalid = target;
      }
      showError(target, message);
    }

    // Richiedi solo il nome
    const firstName = form.querySelector("#firstName");
    if (!firstName || !firstName.value.trim()) {
      addError(firstName, "Il nome è obbligatorio.");
    }

    return { valid: !firstInvalid, firstInvalid };
  }

  function validateSection(section) {
    clearErrors(section);
    return { valid: true, firstInvalid: null };
  }

  window.Validation = {
    validateForm,
    validateSection,
    clearErrors
  };
})();
