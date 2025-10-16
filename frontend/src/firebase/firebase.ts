import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCnOJMvmxXqZKTnZDSZW0MnuRVhALHYA4",
  authDomain: "jeev-app-d9c8c.firebaseapp.com",
  projectId: "jeev-app-d9c8c",
  storageBucket: "jeev-app-d9c8c.appspot.com",
  messagingSenderId: "1098040621778",
  appId: "1:1098040621778:web:c1a0a1b1b1b1b1b1b1b1b1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };


