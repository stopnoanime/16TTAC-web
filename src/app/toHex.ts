export function toHex(value: number, size?: number) {
  return value
    .toString(16)
    .toUpperCase()
    .padStart(size ?? 4, '0');
}
