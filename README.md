# Student Information Questionnaire

A modern, interactive, middle-school friendly questionnaire for student info collection. Built with HTML, CSS, and vanilla JavaScript.

## Features
- Multi-step form (Next/Previous navigation)
- Custom 1–5 rating component
- Progress tracking and section completion indicators
- Auto-save to localStorage (every 30 seconds + on blur/change)
- Real-time validation and error messaging
- Sleep-hours calculator from bedtime and wake time
- Character counters on text areas
- JSON export and print-to-PDF support
- Responsive, mobile-first layout

## Project Structure
```
/student-questionnaire
  /css
    - styles.css
    - rating-component.css
  /js
    - main.js
    - form-handler.js
    - storage.js
    - validation.js
  /images
  - index.html
```

## Getting Started
1. Open [student-questionnaire/index.html](student-questionnaire/index.html) in your browser.
2. Fill out the form. Progress saves automatically.
3. Click **Submit** to validate and download JSON.

## Customization Tips
- Update colors in [student-questionnaire/css/styles.css](student-questionnaire/css/styles.css).
- Add or remove fields in [student-questionnaire/index.html](student-questionnaire/index.html).
- Adjust validation rules in [student-questionnaire/js/validation.js](student-questionnaire/js/validation.js).

## Notes
- Data is stored in the browser's localStorage under the key `studentQuestionnaireData`.
- Printing the page allows saving as PDF using the browser print dialog.
