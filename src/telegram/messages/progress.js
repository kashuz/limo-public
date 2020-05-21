const length = 10;

export default function (done) {
  const progress = Math.min(length, Math.floor(done * length));
  return "⏱ Поиск водителя...\n\n" +
    (done ? '🔵'.repeat(length - progress) + '⚪️'.repeat(progress) : '');
}
