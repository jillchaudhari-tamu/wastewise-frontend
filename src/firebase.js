import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBdwnFc52MLDPrMLjOTPKPWhg66Rv8mpJ4",
  authDomain: "wastewise-3d064.firebaseapp.com",
  projectId: "wastewise-3d064",
  storageBucket: "wastewise-3d064.firebasestorage.app",
  messagingSenderId: "26687157194",
  appId: "1:26687157194:web:b16ed56c23efe4ce561533",
  measurementId: "G-X4RVSXXD9R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);