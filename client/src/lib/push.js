import { getPushPublicKey, saveSubscription, removeSubscription } from './api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function subscribeToPush() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('No diste permiso para las notificaciones.');

  const key = await getPushPublicKey();
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key),
  });

  await saveSubscription(subscription);
  return subscription;
}

export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) await subscription.unsubscribe();
  await removeSubscription();
}

// El servidor guarda la suscripción en un archivo (server/data/push-subscription.json) que
// Render borra en cada redeploy — así que si el navegador ya tiene una suscripción activa
// pero el permiso ya fue otorgado antes, la reenviamos sola al abrir la app. Así la
// notificación diaria se "autocura" sin que Fernando tenga que volver a activar nada.
export async function ensureSubscribed() {
  if (!isPushSupported() || Notification.permission !== 'granted') return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) await saveSubscription(subscription).catch(() => {});
}
