const BUFFER_SIZE = 256;

// Base58 alphabet
const alphabet = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

function randomBytes(buf: Uint8Array) {
  return crypto.getRandomValues(buf);
}

function* getRandomBytesGenerator() {
  const buf = new Uint8Array(BUFFER_SIZE);
  let pos = BUFFER_SIZE;

  while (true) {
    if (pos === BUFFER_SIZE) {
      pos = 0;
      randomBytes(buf);
    }

    yield buf[pos++];
  }
}

function infiniteRand() {
  const generator = getRandomBytesGenerator();

  return {
    next() {
      return generator.next().value as number;
    },
  };
}

const rng = infiniteRand();

const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1;

export function nanoid(n = 12) {
  let id = '';

  for (let i = 0; i < n; i++) {
    let l: any;

    while (l === undefined) {
      l = alphabet[rng.next() & mask];
    }

    id += l;
  }

  return id;
}
