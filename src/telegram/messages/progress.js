const length = 60;

export default function (total, done) {
  const progress = Math.min(length, Math.floor(done * length / total));
  return "➡️" + " ".repeat(progress) + "🚘" + " ".repeat(length - progress) + "🏁";
}
