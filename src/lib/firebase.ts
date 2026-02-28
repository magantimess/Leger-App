import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// NOTE: You need to replace these with your actual Firebase project configuration
// from the Firebase Console (Project Settings > General > Your apps)
const firebaseConfig = {
  apiKey: "AIzaSyCCMafBfl9bd722jUWo6of2IkW778_cUeo",
  authDomain: "mangantimess.firebaseapp.com",
  projectId: "mangantimess",
  storageBucket: "mangantimess.firebasestorage.app",
  messagingSenderId: "129367193535",
  appId: "1:129367193535:web:223fd5ecce1354158e530a",
  measurementId: "G-Q8QKB42TLP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);