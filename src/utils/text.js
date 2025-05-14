export function createAvatarText(text, backgroundColor = '#4CAF50', textColor = '#000000') {
    // Handle empty input
    if (!text || typeof text !== 'string') {
        return '?';
    }

    // Clean up the input text
    text = text.trim();

    // Get initials from words
    const words = text.split(' ').filter(word => word.length > 0);

    if (words.length === 0) {
        return '?';
    } else if (words.length === 1) {
        // If single word, use first two letters
        return words[0].substring(0, 2).toUpperCase();
    } else {
        // Use first letter of first word and first letter of last word
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
}

export function formatDecimalHours(decimalHours) {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours} giờ ${minutes} phút`;
}

export function formatMinutesAndSeconds(decimalMinutes) {
  const minutes = Math.floor(decimalMinutes);
  const seconds = Math.round((decimalMinutes - minutes) * 60);
  return `${minutes} phút ${seconds} giây`;
}