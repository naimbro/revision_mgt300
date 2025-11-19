import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyC4csIfJNGy6yDUp-k9bhEAFrnctb8p-c8",
  authDomain: "revision-mgt300.firebaseapp.com",
  projectId: "revision-mgt300",
  storageBucket: "revision-mgt300.firebasestorage.app",
  messagingSenderId: "230260841916",
  appId: "1:230260841916:web:c02377b3fade3c87389fb9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

// Conectar al emulador en desarrollo local (comentado para usar funciones de producción)
// if (import.meta.env.DEV && window.location.hostname === 'localhost') {
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }

// Login con Google
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

// Login anónimo
export const loginAnonymously = async () => {
  const result = await signInAnonymously(auth);
  return result.user;
};
