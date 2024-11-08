self.addEventListener('push', function (event) {
    const options = {
        body: event.data.text(),
         icon: 'https://yozipic.top/pic/icon.png', // Update this to the correct URL
            badge: 'https://yozipic.top/pic/badge.png'  // Update this to the correct URL
    };

    event.waitUntil(
        self.registration.showNotification('New Message', options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('chat.html') // Open your chat page or a relevant page
    );
});
