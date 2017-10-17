const length = 40;

export default function (done) {
  const progress = Math.min(length, Math.floor(done * length));
  return "⏱ Поиск водителя...\n\n" +
    (done ? '➡️' + ' '.repeat(progress) + '🚘' + ' '.repeat(length - progress) + '🏁' : '');
}
