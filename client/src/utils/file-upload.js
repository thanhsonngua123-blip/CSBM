export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const parts = result.split(',');
      resolve(parts.length > 1 ? parts[1] : result);
    };

    reader.onerror = () => {
      reject(new Error('Không thể đọc file Excel'));
    };

    reader.readAsDataURL(file);
  });
}
