/**
 * Utility to trigger a browser download from a Blob
 * @param blob - The binary data from the server
 * @param filename - The desired name for the file
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  // 1. Create the Blob URL
  const url = window.URL.createObjectURL(blob);
  
  // 2. Create hidden link
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  
  // 3. Trigger download
  document.body.appendChild(link);
  link.click();
  
  // 4. Cleanup
  link.remove();
  window.URL.revokeObjectURL(url);
};