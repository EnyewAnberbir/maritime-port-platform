const FNV_OFFSET = 0xcbf29ce484222325n;
const FNV_PRIME = 0x100000001b3n;
const MASK64 = 0xffffffffffffffffn;

export function fnv1a64(bytes: Uint8Array): bigint {
  let hash = FNV_OFFSET;
  for (let i = 0; i < bytes.length; i += 1) {
    hash ^= BigInt(bytes[i]!);
    hash = (hash * FNV_PRIME) & MASK64;
  }
  return hash;
}

export function fnv1a64Mix(seed: bigint, value: number): bigint {
  let hash = seed ^ BigInt(value >>> 0);
  hash = (hash * FNV_PRIME) & MASK64;
  return hash;
}

export function durableId(parts: string[]): string {
  const encoded = new TextEncoder().encode(parts.join("\u001f"));
  return fnv1a64(encoded).toString(16).padStart(16, "0");
}

export function checksumToNumber(hash: bigint): number {
  return Number(hash & 0xffffffffn);
}
