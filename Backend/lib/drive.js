/**
 * Google Drive link helpers.
 *
 * Sheet me tum koi bhi Drive link daal sakte ho:
 *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   https://drive.google.com/open?id=FILE_ID
 *   https://drive.google.com/uc?export=download&id=FILE_ID
 *   ya sirf FILE_ID
 * Backend har case se file id nikal kar sahi embed/stream URL bana deta hai.
 */

const FILE_ID_PATTERN = /^[a-zA-Z0-9_-]{20,60}$/;

export function extractDriveFileId(input) {
  const value = String(input || '').trim();
  if (!value) return '';

  // Plain file id
  if (FILE_ID_PATTERN.test(value) && !value.includes('/') && !value.includes('.')) {
    return value;
  }

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{20,})/, // /file/d/ID/view
    /\/d\/([a-zA-Z0-9_-]{20,})/,       // /d/ID
    /[?&]id=([a-zA-Z0-9_-]{20,})/,     // ?id=ID
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match && match[1]) return match[1];
  }

  return '';
}

/** Iframe streaming URL — yahi player me chalta hai. */
export function driveEmbedUrl(fileId) {
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : '';
}

/** Auto poster/thumbnail agar sheet me thumbnail column khaali ho. */
export function driveThumbnailUrl(fileId, width = 1280) {
  return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}` : '';
}

/** Drive ka direct-play link (HTML5 <video> ke liye — bade files par reliable nahi hai). */
export function driveDirectUrl(fileId) {
  return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : '';
}

/** YouTube link ko embed URL me badalta hai (bonus source type). */
export function youtubeEmbedUrl(input) {
  const value = String(input || '').trim();
  if (!value) return '';
  const match = value.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}
