self.addEventListener('push', function (event) {
    const options = {
        body: event.data.text(),
        icon: '/icon.png', // Use the icon from the public directory
        badge: '/badge.png', // Optional: Badge image for notifications
    };

    event.waitUntil(
        self.registration.showNotification('New Message', options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/chat') // Open your chat page or a relevant page
    );
});
