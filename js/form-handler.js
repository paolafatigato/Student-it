(function () {
  function downloadJson(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student-questionnaire.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function handleSubmit(form) {
    const result = window.Validation.validateForm(form);
    if (!result.valid) {
      result.firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    const data = window.StorageManager.serializeForm(form);
    console.log("Form submission", data);
    window.StorageManager.saveFormData(form);
    downloadJson(data);

    return true;
  }

  function handleReset(form) {
    form.reset();
    window.StorageManager.clearFormData();
  }

  window.FormHandler = {
    downloadJson,
    handleSubmit,
    handleReset
  };
})();
