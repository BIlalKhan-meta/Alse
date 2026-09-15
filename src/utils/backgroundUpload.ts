import Upload from 'react-native-background-upload';

/**
 * Optional background PUT for large files. Falls back to caller XHR if unsupported.
 */
export async function backgroundPutFile(
  uploadUrl: string,
  filePath: string,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<void> {
  const path = filePath.replace('file://', '');
  await new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Upload cancelled', 'AbortError'));
      return;
    }

    let uploadId: string | undefined;
    const abortUpload = () => {
      if (uploadId) {
        Upload.cancelUpload(uploadId).catch(() => {});
      }
      reject(new DOMException('Upload cancelled', 'AbortError'));
    };
    signal?.addEventListener('abort', abortUpload, {once: true});

    Upload.startUpload({
      url: uploadUrl,
      path,
      method: 'PUT',
      type: 'raw',
      headers,
      notification: {
        enabled: true,
        autoClear: true,
        notificationChannel: 'uploads',
      },
    })
      .then((startedUploadId: string) => {
        uploadId = startedUploadId;
        if (signal?.aborted) {
          Upload.cancelUpload(startedUploadId).catch(() => {});
          return;
        }
        Upload.addListener('error', startedUploadId, (data: any) => {
          signal?.removeEventListener('abort', abortUpload);
          reject(new Error(data?.error || 'Background upload failed'));
        });
        Upload.addListener('cancelled', startedUploadId, () => {
          signal?.removeEventListener('abort', abortUpload);
          reject(new DOMException('Upload cancelled', 'AbortError'));
        });
        Upload.addListener('completed', startedUploadId, (data: any) => {
          signal?.removeEventListener('abort', abortUpload);
          if (data?.responseCode >= 200 && data?.responseCode < 300) {
            resolve();
            return;
          }
          reject(
            new Error(`Background upload failed (${data?.responseCode})`),
          );
        });
      })
      .catch(reject);
  });
}
