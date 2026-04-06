import * as React from 'react';
import { useState, useCallback } from 'react';
import type { ToastProps, ToastActionElement } from './toast';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 3000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

let count = 0;
function genId() { count = (count + 1) % Number.MAX_SAFE_INTEGER; return count.toString(); }

type Toast = Omit<ToasterToast, 'id'>;

const listeners: Array<(state: ToasterToast[]) => void> = [];
let memoryState: ToasterToast[] = [];

function dispatch(toasts: ToasterToast[]) {
  memoryState = toasts;
  listeners.forEach((l) => l(toasts));
}

export function toast({ ...props }: Toast) {
  const id = genId();
  const newToast: ToasterToast = { id, open: true, onOpenChange: (open) => { if (!open) dismiss(id); }, ...props };
  dispatch([...memoryState, newToast].slice(-TOAST_LIMIT));
  setTimeout(() => dismiss(id), TOAST_REMOVE_DELAY);
  return { id, dismiss: () => dismiss(id) };
}

function dismiss(id: string) {
  dispatch(memoryState.map((t) => t.id === id ? { ...t, open: false } : t));
  setTimeout(() => dispatch(memoryState.filter((t) => t.id !== id)), 300);
}

export function useToast() {
  const [toasts, setToasts] = useState<ToasterToast[]>(memoryState);
  React.useEffect(() => {
    listeners.push(setToasts);
    return () => { const idx = listeners.indexOf(setToasts); if (idx > -1) listeners.splice(idx, 1); };
  }, []);
  return { toasts, toast, dismiss };
}
