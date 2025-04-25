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