export function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function todayIsoDate() {
  return toIsoDate(new Date());
}
