import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyCCMafBfl9bd722jUWo6of2IkW778_cUeo",
  authDomain: "mangantimess.firebaseapp.com",
  projectId: "mangantimess",
  storageBucket: "mangantimess.firebasestorage.app",
  messagingSenderId: "129367193535",
  appId: "1:129367193535:web:223fd5ecce1354158e530a",
  measurementId: "G-Q8QKB42TLP"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);