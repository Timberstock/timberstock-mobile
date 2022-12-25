function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}

export function formatDate(date: Date) {
  return `${[
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/')} ${[
    padTo2Digits(date.getHours()),
    padTo2Digits(date.getMinutes()),
  ].join(':')}`;
}
