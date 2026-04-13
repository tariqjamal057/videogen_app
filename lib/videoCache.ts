import * as FS from "expo-file-system/legacy";

export const CAROUSEL_VIDEOS = [
  "https://api.aivideogen.co.in/1.mp4",
  "https://api.aivideogen.co.in/2.mp4",
  "https://api.aivideogen.co.in/3.mp4",
  "https://api.aivideogen.co.in/4.mp4",
  "https://api.aivideogen.co.in/5.mp4",
];

const getFilenameFromUrl = (url: string) => {
  return url.replace(/[^a-zA-Z0-9]/g, "_") + ".mp4";
};

export async function preCacheVideos() {
  await Promise.all(
    CAROUSEL_VIDEOS.map(async (url) => {
      const filename = getFilenameFromUrl(url);
      const localUri = `${FS.cacheDirectory}${filename}`;

      const info = await FS.getInfoAsync(localUri);
      if (!info.exists) {
        try {
          await FS.downloadAsync(url, localUri);
        } catch (e) {
          console.warn(`Failed to pre-cache video: ${url}`, e);
        }
      }
    })
  );
}

export async function getCachedVideoUri(url: string) {
  const filename = getFilenameFromUrl(url);
  const localUri = `${FS.cacheDirectory}${filename}`;
  const info = await FS.getInfoAsync(localUri);
  return info.exists ? localUri : url;
}
