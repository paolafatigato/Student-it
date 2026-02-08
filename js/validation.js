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

    function requireValue(field, message) {
      const value = field?.value ? field.value.trim() : "";
      if (!value) {
        addError(field, message || "This field is required.");
      }
    }

    const firstName = form.querySelector("#firstName");
    const lastName = form.querySelector("#lastName");
    const className = form.querySelector("#className");
    const languagesHome = form.querySelector("#languagesHome");

    requireValue(firstName);
    requireValue(lastName);
    requireValue(className, "Please add your class.");
    requireValue(languagesHome, "Please tell us the languages spoken at home.");

    const studyPlaceRadio = form.querySelector("input[name='studyPlace']");
    if (!isRadioGroupValid("studyPlace", form)) {
      addError(studyPlaceRadio?.closest("fieldset") || studyPlaceRadio, "Please choose where you study.");
    }

    const studyOtherRadio = form.querySelector("#studyOtherRadio");
    const studyOther = form.querySelector("#studyOther");
    if (studyOtherRadio?.checked) {
      requireValue(studyOther, "Please tell us where you study.");
    }

    const screenTime = form.querySelector("#screenTime");
    if (!screenTime?.value) {
      addError(screenTime, "Please choose screen time.");
    }

    const studyHelper = form.querySelector("#studyHelper");
    const homeworkStart = form.querySelector("#homeworkStart");
    const bedTime = form.querySelector("#bedTime");
    const wakeTime = form.querySelector("#wakeTime");

    requireValue(studyHelper);
    requireValue(homeworkStart);
    requireValue(bedTime);
    requireValue(wakeTime);

    const hobbySummary = form.querySelector("#hobbySummary");
    const hobbyInput = form.querySelector("#hobbyInput");
    const hasHobby = Boolean(hobbySummary?.value && hobbySummary.value.trim().length > 0);
    if (!hasHobby) {
      addError(hobbyInput, "Please add at least one hobby.");
    }

    const goodAtFields = ["#goodAt1", "#goodAt2", "#goodAt3"].map((selector) => form.querySelector(selector));
    const hasGoodAt = goodAtFields.some((field) => field?.value && field.value.trim().length > 0);
    if (!hasGoodAt) {
      addError(goodAtFields[0], "Please add at least one thing you are good at.");
    }

    const difficultFields = ["#difficult1", "#difficult2", "#difficult3"].map((selector) => form.querySelector(selector));
    const hasDifficult = difficultFields.some((field) => field?.value && field.value.trim().length > 0);
    if (!hasDifficult) {
      addError(difficultFields[0], "Please add at least one thing you find difficult.");
    }

    const subjectRatingNames = [
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
      "rateCrafts"
    ];
    const ratedCount = subjectRatingNames.filter((name) => isRadioGroupValid(name, form)).length;
    if (ratedCount < 4) {
      const ratingGrid = form.querySelector(".panel[data-step='3'] .rating-grid");
      addError(ratingGrid || form.querySelector("input[name='rateEnglish']"), "Please rate at least 4 subjects.");
    }

    const favoriteSubject = form.querySelector("#favoriteSubject");
    if (!favoriteSubject?.value) {
      addError(favoriteSubject, "Please choose your favorite subject.");
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
