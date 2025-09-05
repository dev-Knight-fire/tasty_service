// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAO5uqKADaB2KNvFxVdTdxufLqApOYomhc",
  authDomain: "kuppertastyservice.firebaseapp.com",
  projectId: "kuppertastyservice",
  storageBucket: "kuppertastyservice.firebasestorage.app",
  messagingSenderId: "1064088809526",
  appId: "1:1064088809526:web:1ef7d3ffa24c2ec8a72897",
  measurementId: "G-G679H6ZZ9Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;