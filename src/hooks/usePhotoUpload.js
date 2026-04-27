import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../firebase';

const MAX_BYTES = 900 * 1024; // 900 KB target (leaves headroom under 1 MB)

/**
 * Resize an image File to fit within maxBytes using a Canvas.
 * Returns the original File unchanged if already small enough.
 */
async function resizeToBlob(file, maxBytes = MAX_BYTES) {
  if (file.size <= maxBytes) return file;

  return new Promise((resolve, reject) => {
    const img       = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Estimate the linear scale factor from the pixel-count ratio
      const ratio  = Math.sqrt(maxBytes / file.size) * 0.9;
      const width  = Math.max(1, Math.floor(img.naturalWidth  * ratio));
      const height = Math.max(1, Math.floor(img.naturalHeight * ratio));

      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(new File([blob], file.name, { type: 'image/jpeg' }))
            : reject(new Error('画像のリサイズに失敗しました')),
        'image/jpeg',
        0.82
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('画像の読み込みに失敗しました'));
    };

    img.src = objectUrl;
  });
}

/**
 * Hook that handles photo resize → Storage upload → Firestore photoUrl write.
 *
 * @param {string} tripId
 * @param {string} planId
 */
export function usePhotoUpload(tripId, planId) {
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  async function upload(file) {
    if (!file || !tripId || !planId) return null;
    setUploading(true);
    setPhotoError(null);
    try {
      const ready      = await resizeToBlob(file);
      const storageRef = ref(storage, `trips/${tripId}/plans/${planId}/photo`);
      await uploadBytes(storageRef, ready);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'trips', tripId, 'plans', planId), { photoUrl: url });
      return url;
    } catch (e) {
      console.error('[usePhotoUpload]', e);
      setPhotoError(e.message ?? 'アップロードに失敗しました');
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, photoError };
}
