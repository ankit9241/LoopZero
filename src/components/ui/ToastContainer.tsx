import React from 'react';
import { useAppStore } from '../../lib/store';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-[#536B4F] shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-[#A33A2B] shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-[#B27622] shrink-0" />,
          info: <Info className="w-4 h-4 text-[#536B4F] shrink-0" />
        };

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto bg-[#FFFFFF] border border-[#E5E4DC] rounded-lg shadow-lg p-3.5 flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-2 duration-200"
          >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#20211D] leading-snug">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-[#777970] mt-0.5 leading-relaxed line-clamp-2">{toast.message}</p>
              )}
              {toast.undoAction && (
                <button
                  onClick={() => {
                    toast.undoAction?.();
                    removeToast(toast.id);
                  }}
                  className="mt-1.5 text-xs font-semibold text-[#536B4F] hover:underline inline-flex items-center"
                >
                  Undo this change
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#9A9C94] hover:text-[#20211D] p-1 rounded-sm"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
