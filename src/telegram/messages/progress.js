const length = 60;

export default function (total, done) {
  const progress = Math.min(length, Math.floor(done * length / total));
  return "⏱ Подождите, поиск водителя в процессе\n\n➡️" + ' '.repeat(progress) + '🚘' + ' '.repeat(length - progress) + '🏁';
}
