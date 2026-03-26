import { ref, onValue, set, onDisconnect } from 'firebase/database';
import { rtdb, auth } from './firebase';

/**
 * Synchronizes the user's online presence with Firebase Realtime Database.
 * When the user connects, their status is set to 'online'.
 * When they disconnect (tab closed, internet lost), it automatically sets to 'offline'.
 */
export function syncPresence() {
  const user = auth.currentUser;
  if (!user) return;

  const presenceRef = ref(rtdb, `presence/${user.uid}`);
  const connectedRef = ref(rtdb, '.info/connected');

  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      // We are connected (or reconnected)!
      // 1. Set online: true
      set(presenceRef, {
        online: true,
        lastSeen: new Date().toISOString(),
      });

      // 2. Schedule 'offline' for when we disconnect
      onDisconnect(presenceRef).set({
        online: false,
        lastSeen: new Date().toISOString(),
      });
    }
  });
}
