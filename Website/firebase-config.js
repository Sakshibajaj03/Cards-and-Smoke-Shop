/* Firebase Configuration - Compat Mode for Browser */
const firebaseConfig = {
  apiKey: "AIzaSyBLFVFDgyVTFSFUEHgzPGYg6INRaqlb_Zg",
  authDomain: "ecommerce-4d8cc.firebaseapp.com",
  projectId: "ecommerce-4d8cc",
  storageBucket: "ecommerce-4d8cc.firebasestorage.app",
  messagingSenderId: "513074660362",
  appId: "1:513074660362:web:b0c03f6027273bdd744bf3",
  measurementId: "G-DG5DHR0VXK"
};

// Initialize Firebase (Compat Mode)
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
