export function convertDurationToText(days) {
    if (days >= 365) {
        const years = days / 365;
        return years === 1 ? "năm" : `${years % 1 === 0 ? years : years.toFixed(1)} năm`;
    } else if (days >= 30) {
        const months = days / 30;
        return months === 1 ? "tháng" : `${months % 1 === 0 ? months : months.toFixed(1)} tháng`;
    } else {
        return `${days} ngày`;
    }
}

export function getTimeUntilStart(startTimeStr) {
    const startTime = new Date(startTimeStr);
    const now = new Date();

    const diffMs = startTime - now;

    if (diffMs <= 0) return "Đã bắt đầu hoặc phát xong.";

    const diffSec = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    return `Còn ${hours}h ${minutes}m ${seconds}s`;
}