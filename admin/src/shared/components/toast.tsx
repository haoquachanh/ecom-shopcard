import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { X } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'info';
type ToastItem = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (item: Omit<ToastItem, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = Date.now() + Math.random();
      setItems((current) => [...current, { ...item, id }]);
      window.setTimeout(() => remove(id), 4200);
    },
    [remove],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack">
        {items.map((item) => (
          <div className={`toast toast--${item.tone}`} key={item.id} role="status">
            <div>
              <strong>{item.title}</strong>
              {item.description ? <p>{item.description}</p> : null}
            </div>
            <button aria-label="Đóng thông báo" onClick={() => remove(item.id)}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
