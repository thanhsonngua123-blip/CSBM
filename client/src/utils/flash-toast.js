const FLASH_TOAST_STORAGE_KEY = 'flash-toast';
const DEFAULT_TOAST_DURATION = 1000;

export function showFlashToast(message, duration = DEFAULT_TOAST_DURATION) {
  if (typeof window === 'undefined' || !message) {
    return;
  }

  window.sessionStorage.setItem(
    FLASH_TOAST_STORAGE_KEY,
    JSON.stringify({
      message,
      expiresAt: Date.now() + duration
    })
  );
}

export function getFlashToast() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawToast = window.sessionStorage.getItem(FLASH_TOAST_STORAGE_KEY);

  if (!rawToast) {
    return null;
  }

  try {
    const toast = JSON.parse(rawToast);

    if (!toast?.message || !Number.isFinite(toast.expiresAt)) {
      clearFlashToast();
      return null;
    }

    if (toast.expiresAt <= Date.now()) {
      clearFlashToast();
      return null;
    }

    return toast;
  } catch {
    clearFlashToast();
    return null;
  }
}

export function clearFlashToast() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(FLASH_TOAST_STORAGE_KEY);
}
