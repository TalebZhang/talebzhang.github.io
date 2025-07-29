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

// 监听 push 事件，使用 event.waitUntil 保证异步完成
self.addEventListener('push', function(event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  let data = {};
  if (event.data) {
    try {
    data = event.data.json();
  } catch (e) {
    // 如果不是 JSON，就把文本当作消息体处理
    data = { title: 'Notification', body: event.data.text() };
  }
  }

  const title = data.notification?.title || 'Default title';
  const options = {
    body: data.notification?.body || 'Default body',
    icon: '/icon.png',  // 确保此路径图标存在
    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// (可选) 监听通知点击事件
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(windowClients => {
      if (windowClients.length) {
        return windowClients[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});

