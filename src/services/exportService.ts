import { ExportOptions, ExportResult, ExportProgressState } from '../types';

/**
 * Service to handle full-resolution photo preparation and browser download
 */
export async function exportAndDownloadPhoto(
  options: ExportOptions,
  onProgress?: (state: ExportProgressState) => void
): Promise<ExportResult> {
  try {
    // 1. Preparing state
    onProgress?.({
      status: 'preparing',
      progressPercent: 25,
      message: 'Preparing photo...'
    });

    // 2. Processing state (sending request to backend high-resolution pipeline)
    onProgress?.({
      status: 'processing',
      progressPercent: 55,
      message: 'Processing full resolution...'
    });

    const response = await fetch('/api/export-photo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      let errorMessage = 'Export failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `Server error (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    const result: ExportResult = await response.json();

    if (!result.success || !result.downloadUrl) {
      throw new Error('Export result was invalid or missing download URL');
    }

    // 3. Ready state
    onProgress?.({
      status: 'ready',
      progressPercent: 90,
      message: 'Download ready',
      filename: result.filename,
      downloadUrl: result.downloadUrl
    });

    // 4. Trigger download in browser (supports Mobile & Desktop)
    await triggerBrowserDownload(result.downloadUrl, result.filename);

    onProgress?.({
      status: 'ready',
      progressPercent: 100,
      message: 'Download complete!',
      filename: result.filename,
      downloadUrl: result.downloadUrl
    });

    return result;
  } catch (error: any) {
    const userMessage = error.message || 'Failed to export photo. Please try again.';
    onProgress?.({
      status: 'error',
      progressPercent: 0,
      message: 'Export failed',
      error: userMessage
    });
    throw error;
  }
}

/**
 * Robust Cross-Platform Browser Download / File Trigger
 * Works on Desktop (Chrome, Safari, Firefox, Edge) and Mobile (iOS Safari, Android Chrome)
 */
export async function triggerBrowserDownload(downloadUrl: string, filename: string): Promise<void> {
  try {
    // Fetch blob for seamless download attribution and mobile compatibility
    const res = await fetch(downloadUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch file: ${res.statusText}`);
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 1500);
  } catch (err) {
    console.warn('Blob download fallback to direct anchor link:', err);
    // Fallback directly to backend attachment route
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 500);
  }
}
