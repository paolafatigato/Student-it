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
- Firebase Firestore submission (optional)
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
    - firebase-service.js
    - storage.js
    - validation.js
  /images
  - index.html
```

## Getting Started
1. Open [student-questionnaire/index.html](student-questionnaire/index.html) in your browser.
2. Fill out the form. Progress saves automatically.
3. Click **Submit** to validate, send to Firebase (if configured), and download JSON.

## Firebase Setup (Optional)
1. Create a Firebase project at https://console.firebase.google.com.
2. In **Build → Firestore Database**, create a database in production mode.
3. In **Project Settings → General → Your apps**, add a Web app and copy the config.
4. Paste the config values into [student-questionnaire/js/firebase-service.js](student-questionnaire/js/firebase-service.js).
5. Set Firestore rules to allow writes and block reads (example below).

Example Firestore rules (allow create only on `responses`):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /responses/{docId} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

## Admin Export Page (Google Login)
Open [student-questionnaire/admin.html](student-questionnaire/admin.html) to load responses and download CSV/JSON.

1. In Firebase Console → Build → Authentication → Sign-in method, enable **Google**.
2. Add your admin email to the allowlist in [student-questionnaire/js/admin.js](student-questionnaire/js/admin.js).
3. Set Firestore rules to allow read only for your admin email:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /responses/{docId} {
      allow create: if true;
      allow read: if request.auth != null
  && request.auth.token.email in ["paola.fatigato@gmail.com"];
      allow update, delete: if false;
    }
  }
}
```

## Customization Tips
- Update colors in [student-questionnaire/css/styles.css](student-questionnaire/css/styles.css).
- Add or remove fields in [student-questionnaire/index.html](student-questionnaire/index.html).
- Adjust validation rules in [student-questionnaire/js/validation.js](student-questionnaire/js/validation.js).

## Notes
- Data is stored in the browser's localStorage under the key `studentQuestionnaireData`.
- Printing the page allows saving as PDF using the browser print dialog.
