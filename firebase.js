import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCTMlMjUD_s5qsMW0II4UvuH0kvYCJWuHY",
  authDomain: "abcd-49111.firebaseapp.com",
  projectId: "abcd-49111",
  storageBucket: "abcd-49111.firebasestorage.app",
  messagingSenderId: "1045754567350",
  appId: "1:1045754567350:web:e30b059136a6a6b11da417",
  measurementId: "G-N5E736XPH8"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const auth = firebase.auth();
export default firebase;
