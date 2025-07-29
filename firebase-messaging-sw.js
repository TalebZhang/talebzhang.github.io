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
 console.log('Service Worker 收到 push 事件');
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
      console.log('收到推送数据:', data);
    } catch (e) {
      // 如果不是 JSON，就把文本当作消息体处理
      data = { title: 'Notification', body: event.data.text() };
    }
  }

  const title = data.title || '新消息！';
  const options = {
    body: data.body || '你有一条来自张振的新消息',
    icon: data.icon || '/icon.png',  // 支持自定义图标路径
    data: data  // 可用于 notificationclick 中识别来源
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      console.log('showNotification 调用成功');
    }).catch(err => {
      console.error('showNotification 调用失败:', err);
    })
  );
});

// 可选：监听通知点击事件
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      if (windowClients.length) {
        return windowClients[0].focus();
      }
      return clients.openWindow('/');  // 可根据 data.url 定制打开路径
    })
  );
});
