import Upload from 'react-native-background-upload';

/**
 * Optional background PUT for large files. Falls back to caller XHR if unsupported.
 */
export async function backgroundPutFile(
  uploadUrl: string,
  filePath: string,
  headers: Record<string, string>,
): Promise<void> {
  const path = filePath.replace('file://', '');
  await new Promise<void>((resolve, reject) => {
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
      .then((uploadId: string) => {
        Upload.addListener('error', uploadId, (data: any) => {
          reject(new Error(data?.error || 'Background upload failed'));
        });
        Upload.addListener('cancelled', uploadId, () => {
          reject(new Error('Upload cancelled'));
        });
        Upload.addListener('completed', uploadId, (data: any) => {
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
