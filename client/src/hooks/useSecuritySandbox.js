import { useEffect, useState } from 'react';
import { securityToolApi } from '../services/api';

export function useSecuritySandbox() {
  const [inputValue, setInputValue] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshSeed, setRefreshSeed] = useState(0);

  useEffect(() => {
    const normalizedInput = inputValue.trim();

    if (!normalizedInput) {
      setPreview(null);
      setError('');
      setLoading(false);
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const res = await securityToolApi.preview(normalizedInput);
        setPreview(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tạo dữ liệu preview');
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [inputValue, refreshSeed]);

  const refreshPreview = () => {
    setRefreshSeed((currentValue) => currentValue + 1);
  };

  return {
    inputValue,
    preview,
    loading,
    error,
    setInputValue,
    refreshPreview
  };
}
