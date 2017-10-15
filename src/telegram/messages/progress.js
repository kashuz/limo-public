const length = 40;

export default function (done) {
  const progress = Math.min(length, Math.floor(done * length));
  return "⏱ Подождите, поиск водителя в процессе\n\n" +
    (done ? '➡️' + ' '.repeat(progress) + '🚘' + ' '.repeat(length - progress) + '🏁' : '');
}
