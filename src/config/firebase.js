import { initializeApp } from "firebase/app";
import { getAuth , GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBqNY_9k6BwoIuWq4LuyaqzxryZV8iRjt0",
  authDomain: "fireform109-013.firebaseapp.com",
  projectId: "fireform109-013",
  storageBucket: "fireform109-013.appspot.com",
  messagingSenderId: "360169642472",
  appId: "1:360169642472:web:682c5c2c3500934411ec5d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
export const storage = getStorage(app);


