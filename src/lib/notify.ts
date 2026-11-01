/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ToastTone = 'success' | 'warning' | 'info';
export interface ToastDetail {
  message: string;
  tone: ToastTone;
}

export const TOAST_EVENT = 'cobasepakat:toast';

// A DOM event keeps notifications decoupled from React state, so any action can announce
// itself without threading a context through every component.
export function notify(message: string, tone: ToastTone = 'success') {
  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { message, tone } }));
}
