importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');


  firebase.initializeApp({
  apiKey: "AIzaSyAwOki0XUie9WKZDLYuV98kwXRkWJS4HU8",
  authDomain: "unchat-82fee.firebaseapp.com",
  projectId: "unchat-82fee",
  storageBucket: "unchat-82fee.firebasestorage.app",
  messagingSenderId: "299427116361",
  appId: "1:299427116361:web:0139208f404a30b74c9698"
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
