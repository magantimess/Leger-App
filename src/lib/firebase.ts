
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);