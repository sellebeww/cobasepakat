/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { TOAST_EVENT, type ToastDetail } from '../../lib/notify';

interface Toast extends ToastDetail {
  id: number;
}

const TONES = {
  success: { icon: CheckCircle2, color: 'text-brand-green', ring: 'border-brand-green-light/40' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', ring: 'border-amber-300' },
  info: { icon: Info, color: 'text-brand-blue', ring: 'border-brand-blue/30' },
};

let nextId = 0;

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));
    const onToast = (e: Event) => {
      const id = ++nextId;
      setToasts((t) => [...t.slice(-3), { id, ...(e as CustomEvent<ToastDetail>).detail }]);
      window.setTimeout(() => dismiss(id), 4500);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed z-[60] bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 flex flex-col gap-2 pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const tone = TONES[t.tone];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className={`pointer-events-auto flex items-start gap-3 bg-white border ${tone.ring} rounded-2xl shadow-xl px-4 py-3`}
            >
              <tone.icon className={`w-5 h-5 shrink-0 mt-0.5 ${tone.color}`} aria-hidden="true" />
              <p className="flex-1 text-sm font-medium text-brand-navy leading-snug">{t.message}</p>
              <button type="button"
                onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
                aria-label="Tutup notifikasi"
                className="text-brand-slate hover:text-brand-navy"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
