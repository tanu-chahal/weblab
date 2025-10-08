// Service Worker for Push Notifications Demo
// This file handles push messages and shows notifications

self.addEventListener('install', function(event) {
    console.log('Service Worker: Installing...');
    // Skip waiting to activate immediately
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activating...');
    // Claim all clients immediately
    event.waitUntil(self.clients.claim());
});

// Handle push messages
self.addEventListener('push', function(event) {
    console.log('Service Worker: Push message received', event);
    
    let notificationData = {
        title: '🔔 Push Notification',
        body: 'You have a new message! This will close automatically.',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle fill="%23007bff" cx="50" cy="50" r="45"/><text y=".7em" x="50%" text-anchor="middle" font-size="40" fill="white">🔔</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle fill="%23007bff" cx="50" cy="50" r="45"/><text y=".7em" x="50%" text-anchor="middle" font-size="30" fill="white">📱</text></svg>',
        vibrate: [200, 100, 200],
        data: { 
            timestamp: Date.now(),
            url: '/',
            autoClose: true
        },
        actions: [
            { action: 'open', title: '👀 Open App' },
            { action: 'close', title: '✖️ Close' }
        ],
        requireInteraction: false,
        silent: false,
        tag: 'push-notification'
    };

    // If push event has data, try to parse it
    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
        } catch (error) {
            // If not JSON, use text
            notificationData.body = event.data.text();
        }
    }

    const options = {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        vibrate: notificationData.vibrate,
        data: notificationData.data,
        actions: notificationData.actions,
        requireInteraction: notificationData.requireInteraction,
        silent: notificationData.silent,
        tag: notificationData.tag,
        timestamp: Date.now()
    };
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, options).then(() => {
            // Auto-close notification after 4 seconds if autoClose is enabled
            if (notificationData.data?.autoClose) {
                setTimeout(() => {
                    self.registration.getNotifications({ tag: notificationData.tag }).then(notifications => {
                        notifications.forEach(notification => {
                            notification.close();
                        });
                    });
                }, 4000);
            }
        })
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
    console.log('Service Worker: Notification clicked', event);
    
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    // Open the app when notification is clicked
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function(clientList) {
            // If there's already a window open, focus it
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === self.location.origin + '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // If no window is open, open a new one
            if (clients.openWindow) {
                const url = event.notification.data?.url || '/';
                return clients.openWindow(url);
            }
        })
    );
});

// Handle notification close events
self.addEventListener('notificationclose', function(event) {
    console.log('Service Worker: Notification closed', event);
});

// Handle background sync (optional)
self.addEventListener('sync', function(event) {
    console.log('Service Worker: Background sync', event);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Perform background sync tasks here
            Promise.resolve()
        );
    }
});

// Handle fetch events (optional - for offline functionality)
self.addEventListener('fetch', function(event) {
    // You can add caching strategies here if needed
    // For this demo, we'll just let all requests pass through
});

console.log('Service Worker: Script loaded');