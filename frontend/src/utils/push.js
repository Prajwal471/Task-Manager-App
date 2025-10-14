// Utilities to register Service Worker and subscribe to Push

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered', reg);
      return reg;
    } catch (err) {
      console.error('Service Worker registration failed:', err);
    }
  }
  return null;
}

export async function askNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  const permission = await Notification.requestPermission();
  return permission; // 'granted' | 'denied' | 'default'
}

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(publicVapidKey, serviceWorkerRegistration) {
  if (!serviceWorkerRegistration) return null;
  try {
    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });
    return subscription;
  } catch (err) {
    console.error('Push subscription failed', err);
    return null;
  }
}
