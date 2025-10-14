import React, { useState, useEffect } from 'react';
import { registerServiceWorker, askNotificationPermission, subscribeToPush } from '../utils/push';

async function getPublicKey() {
  try {
    const res = await fetch('/notifications/public-key');
    return (await res.json()).publicKey;
  } catch (e) {
    console.error('Failed to fetch public key', e);
    return null;
  }
}

export default function NotificationToggle({ user, jwt }) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // check if backend has subscriptions for user (simple check)
    // For now, rely on user.pushSubscriptions if passed in `user`
    if (user && user.pushSubscriptions && user.pushSubscriptions.length > 0) setEnabled(true);
  }, [user]);

  const subscribe = async () => {
    setLoading(true);
    try {
      const reg = await registerServiceWorker();
      if (!reg) throw new Error('Service worker unavailable');

      const perm = await askNotificationPermission();
      if (perm !== 'granted') throw new Error('Permission not granted');

      const key = await getPublicKey();
      if (!key) throw new Error('VAPID key not configured');

      const subscription = await subscribeToPush(key, reg);
      if (!subscription) throw new Error('Subscription failed');

      await fetch('/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: jwt || ''
        },
        body: JSON.stringify({ endpoint: subscription.endpoint, keys: subscription.keys, userAgent: navigator.userAgent })
      });

      setEnabled(true);
    } catch (err) {
      console.error('Subscribe error', err);
      alert('Failed to enable device notifications: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      // find subscription stored in user (best-effort). If not available, ask serviceWorker
      let endpoint = null;
      if (user && user.pushSubscriptions && user.pushSubscriptions.length > 0) endpoint = user.pushSubscriptions[0].endpoint;

      if (!endpoint) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) endpoint = sub.endpoint;
        }
      }

      if (!endpoint) throw new Error('No subscription endpoint found');

      await fetch('/notifications/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: jwt || ''
        },
        body: JSON.stringify({ endpoint })
      });

      // also unsubscribe on SW
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
      }

      setEnabled(false);
    } catch (err) {
      console.error('Unsubscribe error', err);
      alert('Failed to disable device notifications: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label d-flex justify-content-between align-items-center">
        <span>Device Notifications</span>
        <div>
          <button className={`btn ${enabled ? 'btn-danger' : 'btn-success'}`} onClick={enabled ? unsubscribe : subscribe} disabled={loading}>
            {loading ? '...' : (enabled ? 'Disable' : 'Enable')}
          </button>
        </div>
      </label>
      <div className="small text-muted">Enable push notifications to receive reminders on your device.</div>
    </div>
  );
}
