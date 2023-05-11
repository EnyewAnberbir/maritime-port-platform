export function writeU16LE(target: number[], value: number): void {
  target.push(value & 0xff, (value >>> 8) & 0xff);
}

export function writeU32LE(target: number[], value: number): void {
  target.push(
