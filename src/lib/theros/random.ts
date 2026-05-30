export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickMany<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length > 0) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

export function roll(d: number, n = 1): number {
  let s = 0;
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * d) + 1;
  return s;
}

export function chance(p: number): boolean {
  return Math.random() < p;
}
