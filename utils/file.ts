/**
 * Formats a byte size number into a human-readable string (e.g., KB, MB, GB).
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Checks if a filename belongs to a supported image type based on its extension.
 */
export function isImageFile(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext || "");
}

/**
 * Checks if a filename belongs to a supported video type based on its extension.
 */
export function isVideoFile(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "mkv", "mov", "avi"].includes(ext || "");
}
