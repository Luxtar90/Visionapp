import { useCallback } from 'react';
import { showToast } from '../utils/toast';

export const useAlert = () => {
  const showSuccess = useCallback((message: string, title?: string) => {
    showToast({
      type: 'success',
      message,
      title,
    });
  }, []);

  const showError = useCallback((message: string, title?: string) => {
    showToast({
      type: 'error',
      message,
      title,
    });
  }, []);

  const showInfo = useCallback((message: string, title?: string) => {
    showToast({
      type: 'info',
      message,
      title,
    });
  }, []);

  return {
    showSuccess,
    showError,
    showInfo,
  };
};
