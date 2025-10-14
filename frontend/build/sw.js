self.addEventListener('push', function(event) {
  let data = {};
  try { data = event.data.json(); } catch (e) { data = { title: 'TaskFlow', body: event.data?.text() || '' }; }

  const title = (data && data.title) || 'TaskFlow Notification';
  const body = (data && data.body) || (data && data.message) || '';
  const options = {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data || {}
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window' }).then(function(clientList) {
    if (clientList.length > 0) {
      return clientList[0].focus();
    }
    return clients.openWindow('/');
  }));
});
