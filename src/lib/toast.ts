/**
 * Toast Utility for Smart Expert App
 * Dispatches a custom window event to trigger toast notifications across components without prop-drilling.
 */

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export const triggerToast = (message: string, type: ToastType = 'success') => {
  const event = new CustomEvent('show-toast', { 
    detail: { message, type } 
  });
  window.dispatchEvent(event);
};
