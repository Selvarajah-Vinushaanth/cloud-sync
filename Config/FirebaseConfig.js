// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "########################",
  authDomain: "filemangercloud.firebaseapp.com",
  projectId: "filemangercloud",
  storageBucket: "filemangercloud.firebasestorage.app",
  messagingSenderId: "603816482042",
  appId: "1:603816482042:web:363dbeb5128548c51f6543",
  measurementId: "G-05DY9N8SGG"
};

// Initialize Firebase only if no app is already initialized
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
