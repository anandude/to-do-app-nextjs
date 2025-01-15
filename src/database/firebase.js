
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD2Wc1SDWQRbRFlrLN67qo1r2hRpKn1d4Q",
  authDomain: "to-do-app-nextjs-21adb.firebaseapp.com",
  projectId: "to-do-app-nextjs-21adb",
  storageBucket: "to-do-app-nextjs-21adb.firebasestorage.app",
  messagingSenderId: "342816706014",
  appId: "1:342816706014:web:1982a3791af7a9e759e14f"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db};
export const auth = getAuth(app);