// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"
import { 
    collection, 
    getDocs, getDoc,
    addDoc, 
    deleteDoc,  
    doc,
    query,
    where,
    setDoc,
    updateDoc,
    serverTimestamp,
    orderBy
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Firebase Configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7kFRL-goNk_htBELRo02oTK_6h2W1vtU",
  authDomain: "online-shopping-3cc18.firebaseapp.com",
  databaseURL: "https://online-shopping-3cc18-default-rtdb.firebaseio.com",
  projectId: "online-shopping-3cc18",
  storageBucket: "online-shopping-3cc18.firebasestorage.app",
  messagingSenderId: "902502658670",
  appId: "1:902502658670:web:c39b752fe1e7250706ec7f",
  measurementId: "G-QYSMG70WTC"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export async function getProducts() {
  const querySnapshot = await getDocs(collection(db, "products"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Export Firebase Modules

export { auth, db, storage, collection, orderBy,getDocs, addDoc, setDoc, deleteDoc,updateDoc, doc,query,where, serverTimestamp,getDoc };



