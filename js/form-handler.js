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

  async function handleSubmit(form) {
    const result = window.Validation.validateForm(form);
    if (!result.valid) {
      result.firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      return { ok: false, message: "Please complete all required fields." };
    }

    const data = window.StorageManager.serializeForm(form);
    console.log("Form submission", data);

    try {
      if (window.FirebaseService) {
        await window.FirebaseService.submitResponse(data);
      } else {
        throw new Error("Firebase service not available.");
      }
      window.StorageManager.saveFormData(form);
      downloadJson(data);
      return { ok: true };
    } catch (error) {
      console.error("Unable to submit to Firebase", error);
      return { ok: false, message: "Unable to submit right now. Please try again." };
    }
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
