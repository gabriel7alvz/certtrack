import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLVRoiQfK2weKFbZs--Lo3qXkL5kU-TLk",
  authDomain: "certtrack-694be.firebaseapp.com",
  projectId: "certtrack-694be",
  storageBucket: "certtrack-694be.firebasestorage.app",
  messagingSenderId: "896185153544",
  appId: "1:896185153544:web:0406b929cdeedf091a79bd"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
