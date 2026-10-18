/**
 * 将时间戳格式化为中文相对时间描述
 * @param timestamp 毫秒时间戳
 * @returns 刚刚 / N分钟前 / N小时前 / N天前 / 月日
 */
export function formatRelativeTime(timestamp: number): string {
  const d = new Date(timestamp);
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
