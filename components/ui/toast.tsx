'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
};

const iconColors = {
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600',
};

function ToastItem({ toast, onClose }: ToastProps) {
  const Icon = icons[toast.type];

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in',
        colors[toast.type]
      )}
    >
      <Icon className={cn('w-5 h-5 mt-0.5', iconColors[toast.type])} />
      <div className="flex-1">
        <h4 className="font-semibold">{toast.title}</h4>
        {toast.message && (
          <p className="mt-1 text-sm opacity-90">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="p-1 hover:bg-white/20 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Toast Container
export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const TOAST_EVENT = 'show-toast';

  useEffect(() => {
    const listener: EventListener = (event) => {
      const customEvent = event as CustomEvent<Toast>;
      const newToast: Toast = {
        ...customEvent.detail,
        id: Math.random().toString(36).substr(2, 9),
        duration: customEvent.detail.duration || 5000,
      };
      setToasts(prev => [...prev, newToast]);
    };

    window.addEventListener(TOAST_EVENT, listener);
    return () => {
      window.removeEventListener(TOAST_EVENT, listener);
    };
  }, []);

  const handleClose = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={handleClose} />
      ))}
    </div>
  );
}

// Toast 호출 함수
export const toast = {
  success: (title: string, message?: string) => {
    window.dispatchEvent(
      new CustomEvent<Toast>('show-toast', {
        detail: { type: 'success', title, message },
      })
    );
  },
  error: (title: string, message?: string) => {
    window.dispatchEvent(
      new CustomEvent('show-toast', {
        detail: { type: 'error', title, message },
      })
    );
  },
  info: (title: string, message?: string) => {
    window.dispatchEvent(
      new CustomEvent('show-toast', {
        detail: { type: 'info', title, message },
      })
    );
  },
  warning: (title: string, message?: string) => {
    window.dispatchEvent(
      new CustomEvent('show-toast', {
        detail: { type: 'warning', title, message },
      })
    );
  },
};
