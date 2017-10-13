const length = 60;

export default function (total, done) {
  const progress = Math.min(length, Math.floor(done * length / total));
  return "⏱ Please wait while your order is being handled\n\n➡️" + ' '.repeat(progress) + '🚘' + ' '.repeat(length - progress) + '🏁';
}
