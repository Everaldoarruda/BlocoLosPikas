// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBGOdNHL_Rl-jNpg6F0xTehwI5SGkhWfKg",
    authDomain: "camisalospika.firebaseapp.com",
    projectId: "camisalospika",
    storageBucket: "camisalospika.firebasestorage.app",
    messagingSenderId: "853461189367",
    appId: "1:853461189367:web:4509e07876f8b335dd89f2",
    measurementId: "G-MBLNCK6B2W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
