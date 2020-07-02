import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import * as firebase from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyAkUCtDL6nGSM-FmW2PN9cAMkre1do41BM",
  authDomain: "image-upload-f37d4.firebaseapp.com",
  databaseURL: "https://image-upload-f37d4.firebaseio.com",
  projectId: "image-upload-f37d4",
  storageBucket: "image-upload-f37d4.appspot.com",
  messagingSenderId: "919572141671",
  appId: "1:919572141671:web:20fdecf5c4fdac5f54a6c2",
  measurementId: "G-BCC1BRGW6W"
};
firebase.initializeApp(firebaseConfig);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
