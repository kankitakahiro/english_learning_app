import firebase from 'firebase/app';
import 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCLDwlXXwQlkdGyQl9Dr7DzIPv2-LpO2s8",
    authDomain: "hack-u-deploy.firebaseapp.com",
    projectId: "hack-u-deploy",
    storageBucket: "hack-u-deploy.appspot.com",
    messagingSenderId: "279349836994",
    appId: "1:279349836994:web:9ea37734da9e027e484f5b",
    measurementId: "G-5CXP98HE4X"
};

firebase.initializeApp(firebaseConfig);