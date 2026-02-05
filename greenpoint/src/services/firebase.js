// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";   // ✅ IMPORTANT

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArW8ph7NNnwjnFeKMlXDnah7GhrEoCn8Y",
  authDomain: "greenpoints-97d43.firebaseapp.com",
  projectId: "greenpoints-97d43",
  storageBucket: "greenpoints-97d43.firebasestorage.app",
  messagingSenderId: "130184976061",
  appId: "1:130184976061:web:124c1723c5e3170ce209d4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
