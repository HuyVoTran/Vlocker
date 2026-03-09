/**
 * Lightweight in-memory pub/sub for locker events (SSE).
 * Note: This is process-local and best for dev/local or single-instance.
 */

const globalStore = globalThis.__lockerEventsStore || {
  clients: new Set(),
};

if (!globalThis.__lockerEventsStore) {
  globalThis.__lockerEventsStore = globalStore;
}

export function addLockerClient(controller) {
  globalStore.clients.add(controller);
}

export function removeLockerClient(controller) {
  globalStore.clients.delete(controller);
}

export function broadcastLockerEvent(event) {
  const payload = `event: locker\ndata: ${JSON.stringify(event)}\n\n`;
  for (const controller of globalStore.clients) {
    try {
      controller.enqueue(payload);
    } catch {
      globalStore.clients.delete(controller);
    }
  }
}
