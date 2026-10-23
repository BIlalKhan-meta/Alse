import {Platform} from 'react-native';
import Upload from 'react-native-background-upload';

let uploadChannelEnsured = false;

function ensureAndroidUploadChannel() {
  if (Platform.OS !== 'android' || uploadChannelEnsured) {
    return;
  }
  uploadChannelEnsured = true;
  try {
    // Notifee / PushNotification may not own this channel; create via RN background-upload
    // by posting with notifications disabled if channel APIs are unavailable.
    const PushNotification = require('react-native-push-notification').default;
    PushNotification.createChannel?.(
      {
        channelId: 'uploads',
        channelName: 'Uploads',
        channelDescription: 'Media upload progress',
        importance: 2,
        vibrate: false,
        playSound: false,
      },
      () => {},
    );
  } catch (_) {
    // Optional — upload still works without a named channel if notifications are off.
  }
}

/**
 * Optional background PUT for large files. Falls back to caller XHR if unsupported.
 * Notifications disabled by default on Android to avoid OEM SecurityException /
 * missing-channel crashes during upload (ALSE SecurityException / OOM stacks).
 */
export async function backgroundPutFile(
  uploadUrl: string,
  filePath: string,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<void> {
  ensureAndroidUploadChannel();
  const path = filePath.replace('file://', '');
  await new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Upload cancelled', 'AbortError'));
      return;
    }

    let uploadId: string | undefined;
    let settled = false;
    const listeners: Array<{remove?: () => void} | void> = [];

    const cleanup = () => {
      listeners.forEach(l => {
        try {
          l?.remove?.();
        } catch (_) {}
      });
      signal?.removeEventListener('abort', abortUpload);
    };

    const settle = (fn: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      fn();
    };

    const abortUpload = () => {
      if (uploadId) {
        Upload.cancelUpload(uploadId).catch(() => {});
      }
      settle(() =>
        reject(new DOMException('Upload cancelled', 'AbortError')),
      );
    };
    signal?.addEventListener('abort', abortUpload, {once: true});

    Upload.startUpload({
      url: uploadUrl,
      path,
      method: 'PUT',
      type: 'raw',
      headers,
      notification: {
        // Keep quiet on Android — foreground service + missing RECEIVER flags
        // has crashed OEM devices during video upload.
        enabled: Platform.OS === 'ios',
        autoClear: true,
        notificationChannel: 'uploads',
      },
    })
      .then((startedUploadId: string) => {
        uploadId = startedUploadId;
        if (signal?.aborted) {
          Upload.cancelUpload(startedUploadId).catch(() => {});
          settle(() =>
            reject(new DOMException('Upload cancelled', 'AbortError')),
          );
          return;
        }
        listeners.push(
          Upload.addListener('error', startedUploadId, (data: any) => {
            settle(() =>
              reject(new Error(data?.error || 'Background upload failed')),
            );
          }),
        );
        listeners.push(
          Upload.addListener('cancelled', startedUploadId, () => {
            settle(() =>
              reject(new DOMException('Upload cancelled', 'AbortError')),
            );
          }),
        );
        listeners.push(
          Upload.addListener('completed', startedUploadId, (data: any) => {
            settle(() => {
              if (data?.responseCode >= 200 && data?.responseCode < 300) {
                resolve();
                return;
              }
              reject(
                new Error(`Background upload failed (${data?.responseCode})`),
              );
            });
          }),
        );
      })
      .catch(error => settle(() => reject(error)));
  });
}
