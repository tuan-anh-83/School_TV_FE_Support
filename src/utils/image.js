export function extractVideoId(url) {
    const parts = url.split("/");
    // Lấy phần trước "/iframe" hoặc "/webRTC/play"
    const videoId = parts.find((part) => /^[a-f0-9]{32}$/i.test(part));
    return videoId;
}

export function getYouTubeThumbnail(url, quality = "hqdefault") {
  const regex =
    /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  if (!match || !match[1]) return null;

  const videoId = match[1];
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}