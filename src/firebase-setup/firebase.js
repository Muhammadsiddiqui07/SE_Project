import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyApNu8sxriy-I7XYEmBmIi159dP2wcxHXs",
  authDomain: "e-learning-529e3.firebaseapp.com",
  projectId: "e-learning-529e3",
  storageBucket: "e-learning-529e3.appspot.com",
  messagingSenderId: "190515335906",
  appId: "1:190515335906:web:06058fb868cda4779884bb"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
