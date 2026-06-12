export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function fromDateInputValue(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}
