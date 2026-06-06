import { writable } from 'svelte/store';

export const toasts = writable([]);

let counter = 0;

export function addToast(message, type = 'success', duration = 4000) {
  const id = ++counter;
  toasts.update(list => [...list, { id, message, type }]);
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
  return id;
}

export function removeToast(id) {
  toasts.update(list => list.filter(t => t.id !== id));
}
