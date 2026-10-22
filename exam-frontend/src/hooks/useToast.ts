/**
 * Re-exported from the toast context so feature code can keep importing hooks
 * from `@/hooks` while the provider lives in `@/context/ToastContext`.
 */
export { useToast } from '@/context/ToastContext';
export type { ToastApi, ToastTone } from '@/context/ToastContext';
