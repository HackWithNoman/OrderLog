import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_DURATION_MS = 3000;
const ERROR_TOAST_DURATION_MS = 5000;

/**
 * Small toast state helper. `showToast(message, type)` displays a message for
 * a few seconds; `type` is one of "success" | "error" | "info".
 */
export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(
      () => setToast(null),
      type === 'error' ? ERROR_TOAST_DURATION_MS : TOAST_DURATION_MS,
    );
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { toast, showToast, dismissToast };
}
