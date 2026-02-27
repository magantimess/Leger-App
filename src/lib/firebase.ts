import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCCMafBfl9bd722jUWo6of2IkW778_cUeo",
  authDomain: "mangantimess.firebaseapp.com",
  projectId: "mangantimess",
  storageBucket: "mangantimess.firebasestorage.app",
  messagingSenderId: "129367193535",
  appId: "1:129367193535:web:223fd5ecce1354158e530a",
  measurementId: "G-Q8QKB42TLP"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);