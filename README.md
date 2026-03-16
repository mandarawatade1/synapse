<div align="center">
<img width="1200" height="475" alt="Synapse Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Synapse Dashboard

Welcome to the Synapse Dashboard! This is a comprehensive student dashboard application built with React, Vite, Tailwind CSS, and powered by Firebase and the Gemini API.

## Features
- **AI-Powered Insights:** Uses Google's Gemini API for intelligent features.
- **Firebase Backend:** User authentication, profiles, quest progress, and content storage (quizzes, notes, transcripts) are securely managed via Firebase.
- **Modern UI:** Responsive design using Tailwind CSS.

---

## 🚀 Getting Started

Follow these step-by-step instructions to run the application locally on your machine.

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- `npm` (comes with Node.js)

### 1. Clone or Download the Repository
If you haven't already, open your terminal and navigate to the project directory:
```bash
cd Synapse
```

### 2. Install Dependencies
Install all the required packages to run the project:
```bash
npm install
```

### 3. Set Up Environment Variables (`.env.local`)
The application relies on the Gemini API. You need to provide your API keys for the app to function properly.

1. In the root of your project directory, create a file named `.env.local`.
2. Open the file and add your Gemini API keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
*(Note: Replace `your_gemini_api_key_here` with your actual Gemini API keys if modifying from scratch. The current `.env.local` contains some initial setup.)*

**Firebase Configuration:** The application comes pre-configured with Firebase in `src/services/firebase.ts`. If you wish to use your own Firebase project in the future, you will need to update the `firebaseConfig` details in that file.

### 4. Run the Development Server
Test the website locally by starting the Vite development server.
```bash
npm run dev
```
Once the server starts, open your browser and navigate to the specified local URL (typically [http://localhost:5173](http://localhost:5173)). The app should hot-reload automatically as you make changes to the code.

---

## 🛠️ Available Scripts

In the project directory, you can run:

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the app for production into the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.
- **`npm run preview`**: Bootstraps a local web server that serves the production build from the `dist` folder for last-minute testing before deploying.

---

## 🧪 Testing the Website

Currently, the primary way to test the website is through manual testing:
1. Run `npm run dev` in your terminal.
2. Open `http://localhost:5173` in your browser.
3. Verify that the UI loads correctly and responsive elements work.
4. Try features like login to ensure Google Sign-In via Firebase is functioning.
5. Test any AI-related features (e.g., Study Buddy) to ensure your Gemini API key from `.env.local` is being successfully picked up.
