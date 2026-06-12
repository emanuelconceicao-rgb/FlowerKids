import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBBV0sVrQYOtSquWJUYMMfB0ySEdhbSsw0",
    authDomain: "flower-kids.firebaseapp.com",
    projectId: "flower-kids",
    storageBucket: "flower-kids.firebasestorage.app",
    messagingSenderId: "697591788058",
    appId: "1:697591788058:web:05102c66ac3019369ad7a3"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);