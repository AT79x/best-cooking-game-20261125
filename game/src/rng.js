// Seeded random numbers (mulberry32) so the screenshot scenes and the
// play-test can replay the exact same game from a fixed seed.
export function makeRng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick one element of `list` using `rng`. */
export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

/** An integer in [min, max] using `rng`. */
export function range(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}
