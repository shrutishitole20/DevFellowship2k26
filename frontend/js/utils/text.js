export function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function highlightText(text, searchStr) {
  if (!searchStr || !searchStr.trim()) return text;
  try {
    const escapedStr = searchStr.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedStr})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  } catch (err) {
    return text;
  }
}

export function estimateReadTime(content) {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  return Math.ceil(words / 200);
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}
