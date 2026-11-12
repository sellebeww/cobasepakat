import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { appendEntry, canonicalJson, GENESIS_HASH, headMatches, sha256Hex, verifyChain, type LedgerEntry } from '../src/core/ledger';

async function build(n: number): Promise<LedgerEntry[]> {
  let chain: LedgerEntry[] = [];
  for (let i = 0; i < n; i++) {
    chain = await appendEntry(chain, { timestamp: `2026-10-${String(10 + i).padStart(2, '0')}T08:00:00Z`, actor: `u${i % 3}`, type: 'keputusan', payload: { outcome: 'adopsi', n: i, nested: { a: [1, 2, { b: i }] } } });
  }
  return chain;
}

describe('canonicalJson', () => {
  it('kunci terurut dan stabil; undefined dibuang', () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: [3, undefined] }, z: undefined })).toBe('{"a":{"c":[3,null],"d":2},"b":1}');
    expect(canonicalJson({ a: 1, b: 2 })).toBe(canonicalJson({ b: 2, a: 1 }));
  });
  it('menolak angka non-hingga dan tipe tak didukung', () => {
    expect(() => canonicalJson({ a: Number.NaN })).toThrow(TypeError);
    expect(() => canonicalJson({ a: () => 1 })).toThrow(TypeError);
    expect(() => canonicalJson(1n)).toThrow(TypeError);
  });
});

describe('sha256Hex', () => {
  it('vektor uji baku', async () => {
    expect(await sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});

describe('ledger', () => {
  it('rantai kosong valid dan head = genesis', async () => {
    const v = await verifyChain([]);
    expect(v).toMatchObject({ valid: true, head: GENESIS_HASH, length: 0 });
  });
  it('rantai utuh valid; entri pertama menunjuk genesis', async () => {
    const chain = await build(5);
    expect(chain[0].prevHash).toBe(GENESIS_HASH);
    const v = await verifyChain(chain);
    expect(v.valid).toBe(true);
    expect(v.head).toBe(chain[4].hash);
  });
  it('appendEntry tidak memodifikasi rantai lama', async () => {
    const chain = await build(2);
    const snap = JSON.stringify(chain);
    await appendEntry(chain, { timestamp: 't', actor: 'a', type: 'x', payload: 1 });
    expect(JSON.stringify(chain)).toBe(snap);
  });
  it('menyunting isi entri tengah terdeteksi di entri itu', async () => {
    const chain = await build(4);
    const tampered = chain.map((e, i) => (i === 2 ? { ...e, payload: { outcome: 'kembalikan_ke_semula' } } : e));
    expect(await verifyChain(tampered)).toMatchObject({ valid: false, brokenAt: 2, reason: 'hash' });
  });
  it('menyunting lalu menghitung ulang hash entri itu tetap terdeteksi di entri berikutnya', async () => {
    const chain = await build(4);
    const edited = { ...chain[1], payload: 'diubah' };
    const rehashed = (await appendEntry(chain.slice(0, 1), { timestamp: edited.timestamp, actor: edited.actor, type: edited.type, payload: edited.payload }))[1];
    const tampered = [chain[0], rehashed, chain[2], chain[3]];
    expect(await verifyChain(tampered)).toMatchObject({ valid: false, brokenAt: 2, reason: 'prev_hash' });
  });
  it('menghapus entri tengah, menukar urutan, atau menyisipkan terdeteksi', async () => {
    const chain = await build(4);
    expect((await verifyChain([chain[0], chain[2], chain[3]])).valid).toBe(false);
    expect((await verifyChain([chain[0], chain[2], chain[1], chain[3]])).valid).toBe(false);
    expect((await verifyChain([chain[0], { ...chain[1], index: 1 }, { ...chain[1], index: 2 }])).valid).toBe(false);
  });
  it('pemotongan ekor TIDAK terdeteksi oleh rantai, tetapi terdeteksi oleh head yang dijangkarkan', async () => {
    const chain = await build(4);
    const anchored = (await verifyChain(chain)).head;
    const truncated = chain.slice(0, 3);
    expect((await verifyChain(truncated)).valid).toBe(true); // batas yang diketahui
    expect(headMatches(truncated, anchored)).toBe(false);
    expect(headMatches(chain, anchored)).toBe(true);
  });
  it('property: mengubah field apa pun pada entri mana pun membuat verifikasi gagal', async () => {
    const chain = await build(6);
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 0, max: 5 }), fc.constantFrom('timestamp', 'actor', 'type', 'payload', 'hash', 'prevHash', 'index'), async (i, field) => {
        const mutated = chain.map((e, k) => {
          if (k !== i) return e;
          const copy: Record<string, unknown> = { ...e };
          copy[field] = field === 'index' ? e.index + 1 : field === 'payload' ? { x: 'lain' } : `${String(e[field as keyof LedgerEntry])}x`;
          return copy as unknown as LedgerEntry;
        });
        const v = await verifyChain(mutated);
        return v.valid === false && v.brokenAt !== undefined && v.brokenAt <= i + 1;
      }),
      { numRuns: 60 },
    );
  });
  it('property: payload apa pun yang valid JSON dapat ditambahkan dan terverifikasi', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(fc.jsonValue(), { minLength: 1, maxLength: 6 }), async (payloads) => {
        let chain: LedgerEntry[] = [];
        for (const [i, payload] of payloads.entries()) chain = await appendEntry(chain, { timestamp: `t${i}`, actor: 'a', type: 't', payload });
        return (await verifyChain(chain)).valid;
      }),
      { numRuns: 40 },
    );
  });
  it('entri berformat rusak (payload tak bisa dikanonkan) dilaporkan sebagai format', async () => {
    const chain = await build(2);
    const bad = [chain[0], { ...chain[1], payload: { x: Number.NaN } }];
    expect(await verifyChain(bad)).toMatchObject({ valid: false, brokenAt: 1, reason: 'format' });
  });
});
