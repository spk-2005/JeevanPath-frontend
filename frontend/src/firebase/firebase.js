// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACcDGm8rFCoBS6Bz3FTMWrgH9J3H-yHAw",
  authDomain: "jeevanpath-hackthon.firebaseapp.com",
  projectId: "jeevanpath-hackthon",
  storageBucket: "jeevanpath-hackthon.appspot.com",
  messagingSenderId: "333197561735",
  appId: "1:333197561735:web:7ec9f2b94d9d7b9555cd22"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, firebaseConfig };