// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDlWK4sldcHQrPZRmMiNJnGZy1ae9Ivk3A",
  authDomain: "horse-jump-99db2.firebaseapp.com",
  databaseURL: "https://horse-jump-99db2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "horse-jump-99db2",
  storageBucket: "horse-jump-99db2.firebasestorage.app",
  messagingSenderId: "380757377072",
  appId: "1:380757377072:web:981d89813b9230c3882df5",
  measurementId: "G-YE5MNBVP2T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
