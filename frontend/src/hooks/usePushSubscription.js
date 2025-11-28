import { useEffect } from 'react';
import { registerServiceWorker, askNotificationPermission, subscribeToPush } from '../utils/push';

export default function usePushSubscription(user) {
  useEffect(() => {
    if (!user || !user.userId) return;

    (async () => {
      try {
        // Register service worker
        const reg = await registerServiceWorker();
        if (!reg) return;

        // Ask permission
        const perm = await askNotificationPermission();
        if (perm !== 'granted') return;

        // Fetch public key
        const res = await fetch('/notifications/public-key');
        const json = await res.json();
        if (!json || !json.publicKey) return;

        const subscription = await subscribeToPush(json.publicKey, reg);
        if (!subscription) return;

        // Send subscription to backend
        const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
        const authHeader = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '';
        
        await fetch('/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader
          },
          body: JSON.stringify({ endpoint: subscription.endpoint, keys: subscription.keys, userAgent: navigator.userAgent })
        });
      } catch (err) {
        console.error('Push subscribe flow error', err);
      }
    })();

  }, [user]);
}
