import { useEffect } from 'react';

const OVERLAY = 'div.fixed.inset-0.z-50';
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
let seq = 0;

const isIconOnly = (b: HTMLElement) => !b.textContent?.trim();
const closeButton = (d: HTMLElement) =>
  Array.from(d.querySelectorAll<HTMLButtonElement>('button')).find(
    (b) => isIconOnly(b) || /^(batal|tutup)/i.test(b.textContent!.trim()),
  );

// All modals share the same overlay markup, so dialog semantics, focus handling and Escape
// are applied here once instead of in each modal.
export function useDialogA11y() {
  useEffect(() => {
    const openers = new Map<HTMLElement, Element | null>();
    const dialogs = () => Array.from(document.querySelectorAll<HTMLElement>(OVERLAY));

    const sync = () => {
      const open = dialogs();
      for (const d of open) {
        if (openers.has(d)) continue;
        openers.set(d, document.activeElement);
        d.setAttribute('role', 'dialog');
        d.setAttribute('aria-modal', 'true');
        const title = d.querySelector('h1,h2,h3');
        if (title) {
          title.id ||= `dialog-title-${++seq}`;
          d.setAttribute('aria-labelledby', title.id);
        }
        const icon = Array.from(d.querySelectorAll<HTMLElement>('button')).find(isIconOnly);
        if (icon && !icon.getAttribute('aria-label')) icon.setAttribute('aria-label', 'Tutup');
        (d.querySelector<HTMLElement>('input,textarea,select') ?? d.querySelector<HTMLElement>(FOCUSABLE))?.focus();
      }
      for (const [d, opener] of openers) {
        if (d.isConnected) continue;
        openers.delete(d);
        (opener as HTMLElement | null)?.focus?.();
      }
      document.body.style.overflow = open.length ? 'hidden' : '';
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const d = dialogs().pop();
      if (!d) return;
      if (e.key === 'Escape') {
        closeButton(d)?.click();
      } else if (e.key === 'Tab') {
        const items = Array.from(d.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (!d.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('keydown', onKeyDown);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, []);
}
