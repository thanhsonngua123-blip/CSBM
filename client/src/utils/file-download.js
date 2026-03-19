export function downloadBlobResponse(response, fallbackFileName) {
  const contentDisposition = response.headers['content-disposition'] || '';
  const matchedFileName = contentDisposition.match(/filename="(.+)"/i);
  const fileName = matchedFileName?.[1] || fallbackFileName;
  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || 'application/octet-stream'
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
