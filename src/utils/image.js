export function extractVideoId(url) {
    const parts = url.split("/");
    // Lấy phần trước "/iframe" hoặc "/webRTC/play"
    const videoId = parts.find((part) => /^[a-f0-9]{32}$/i.test(part));
    return videoId;
}