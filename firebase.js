// Firebase configuration and Firestore operations
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  orderBy, 
  query, 
  serverTimestamp 
} from "firebase/firestore";

// User's Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCxUOZeIeEmk9-9dv6QVo7JfbSQs-Y9m8",
  authDomain: "calculator-e9ac4.firebaseapp.com",
  projectId: "calculator-e9ac4",
  storageBucket: "calculator-e9ac4.firebasestorage.app",
  messagingSenderId: "894872425877",
  appId: "1:894872425877:web:719b716e48b2c14b32529c",
  measurementId: "G-N0NXG80RM3"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTION_NAME = "leaderboard_history";
const LOCAL_BACKUP_KEY = "school_calc_firebase_backup_history";

/**
 * Save complete table calculation to Firestore Cloud Database
 */
export async function saveCalculationHistory(data) {
  const record = {
    title: data.title || `Competition Round - ${new Date().toLocaleDateString()}`,
    createdAt: serverTimestamp(),
    localDate: new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    weights: data.weights,
    schools: data.schools,
    totalSchools: data.schools.length,
    grandTotal: data.grandTotal,
    winner: data.winner || { name: 'None', score: 0 }
  };

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), record);
    // Also save in local backup
    backupLocally({ id: docRef.id, ...record, createdAt: new Date().toISOString() });
    return { success: true, id: docRef.id, source: 'firestore' };
  } catch (err) {
    console.warn("Firestore write error (check security rules):", err);
    // Fallback to local storage so user data is never lost
    const localId = 'local_' + Date.now();
    backupLocally({ id: localId, ...record, createdAt: new Date().toISOString(), localOnly: true });
    return { 
      success: true, 
      id: localId, 
      source: 'local', 
      warning: err.code === 'permission-denied' 
        ? 'Permission Denied: Please update Firestore Security Rules in Firebase Console!'
        : err.message 
    };
  }
}

/**
 * Fetch all saved calculation history from Firestore
 */
export async function fetchCalculationHistory() {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const historyList = [];
    
    snapshot.forEach(docSnap => {
      historyList.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Merge with any local offline records
    const localList = getLocalBackup();
    const merged = [...historyList];
    localList.forEach(item => {
      if (!merged.some(m => m.id === item.id)) {
        merged.push(item);
      }
    });

    return { success: true, data: merged };
  } catch (err) {
    console.warn("Firestore fetch error:", err);
    const localList = getLocalBackup();
    return { 
      success: false, 
      data: localList, 
      error: err.code === 'permission-denied'
        ? 'Firestore Rules locked: allow read, write: if true; is required.'
        : err.message
    };
  }
}

/**
 * Delete a calculation record from Firestore
 */
export async function deleteCalculationHistory(id) {
  try {
    if (!id.startsWith('local_')) {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    }
    deleteFromLocalBackup(id);
    return { success: true };
  } catch (err) {
    console.warn("Firestore delete error:", err);
    deleteFromLocalBackup(id);
    return { success: false, error: err.message };
  }
}

// Local storage backup utilities
function backupLocally(record) {
  try {
    const list = getLocalBackup();
    list.unshift(record);
    localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (e) {
    console.error(e);
  }
}

function getLocalBackup() {
  try {
    const val = localStorage.getItem(LOCAL_BACKUP_KEY);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    return [];
  }
}

function deleteFromLocalBackup(id) {
  try {
    let list = getLocalBackup();
    list = list.filter(item => item.id !== id);
    localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export { db, app };
