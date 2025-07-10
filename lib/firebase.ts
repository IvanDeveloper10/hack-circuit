import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAUgG3w96__NA6g2CXszsvbpKYFZV2sO5I',
  authDomain: 'fir-game-ef5f5.firebaseapp.com',
  databaseURL: 'https://fir-game-ef5f5-default-rtdb.firebaseio.com',
  projectId: 'fir-game-ef5f5',
  storageBucket: 'fir-game-ef5f5.appspot.com', 
  messagingSenderId: '256022427269',
  appId: '1:256022427269:web:a1738de68fb291d865dbec'
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };