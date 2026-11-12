/**
 * Buku besar berantai hash (hash chain) untuk riwayat keputusan dan audit.
 *
 * Tujuan: penyuntingan diam-diam terhadap entri lama (isi, urutan, atau penghapusan di tengah)
 * terdeteksi saat verifikasi.
 *
 * Batas yang harus dinyatakan jujur:
 * - Rantai saja tidak mencegah penulis menulis ulang SELURUH rantai dari awal, atau memotong ekor.
 *   Karena itu `head` (hash entri terakhir) perlu dijangkarkan di tempat lain (database server,
 *   laporan PDF, pesan grup). Di Supabase, hash dihitung dan dikunci server-side.
 * - Ini bukan tanda tangan digital: hash tidak membuktikan siapa penulisnya.
 */

export const GENESIS_HASH = '0'.repeat(64);

export interface LedgerInput {
  timestamp: string;
  actor: string;
  type: string;
  payload: unknown;
}

export interface LedgerEntry extends LedgerInput {
  index: number;
  prevHash: string;
  hash: string;
}

export type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

/** JSON kanonik: kunci terurut, `undefined` dibuang pada objek, angka non-hingga ditolak. */
export function canonicalJson(value: unknown): string {
  if (value === null) return 'null';
  switch (typeof value) {
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      if (!Number.isFinite(value)) throw new TypeError('Angka non-hingga tidak boleh masuk ke buku besar');
      return JSON.stringify(value);
    case 'string':
      return JSON.stringify(value);
    case 'object': {
      if (Array.isArray(value)) return `[${value.map((v) => canonicalJson(v === undefined ? null : v)).join(',')}]`;
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj)
        .filter((k) => obj[k] !== undefined)
        .sort();
      return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(',')}}`;
    }
    default:
      throw new TypeError(`Tipe ${typeof value} tidak didukung di buku besar`);
  }
}

export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function entryHashInput(e: Pick<LedgerEntry, 'index' | 'prevHash' | 'timestamp' | 'actor' | 'type' | 'payload'>): string {
  return canonicalJson({
    index: e.index,
    prevHash: e.prevHash,
    timestamp: e.timestamp,
    actor: e.actor,
    type: e.type,
    payload: e.payload,
  });
}

export async function appendEntry(chain: readonly LedgerEntry[], input: LedgerInput): Promise<LedgerEntry[]> {
  const prev = chain[chain.length - 1];
  const base = {
    index: chain.length,
    prevHash: prev ? prev.hash : GENESIS_HASH,
    timestamp: input.timestamp,
    actor: input.actor,
    type: input.type,
    payload: input.payload,
  };
  const hash = await sha256Hex(entryHashInput(base));
  return [...chain, { ...base, hash }];
}

export type ChainFailure = 'index' | 'prev_hash' | 'hash' | 'format';

export interface ChainVerification {
  valid: boolean;
  /** Indeks entri pertama yang rusak. */
  brokenAt?: number;
  reason?: ChainFailure;
  /** Hash entri terakhir, untuk dijangkarkan. GENESIS_HASH bila rantai kosong. */
  head: string;
  length: number;
}

export async function verifyChain(chain: readonly LedgerEntry[]): Promise<ChainVerification> {
  let prevHash = GENESIS_HASH;
  for (let i = 0; i < chain.length; i++) {
    const e = chain[i];
    const fail = (reason: ChainFailure): ChainVerification => ({
      valid: false,
      brokenAt: i,
      reason,
      head: chain[chain.length - 1]?.hash ?? GENESIS_HASH,
      length: chain.length,
    });
    if (e.index !== i) return fail('index');
    if (e.prevHash !== prevHash) return fail('prev_hash');
    let expected: string;
    try {
      expected = await sha256Hex(entryHashInput(e));
    } catch {
      return fail('format');
    }
    if (e.hash !== expected) return fail('hash');
    prevHash = e.hash;
  }
  return { valid: true, head: prevHash, length: chain.length };
}

/** Bandingkan head yang dijangkarkan dengan rantai saat ini: mendeteksi pemotongan ekor. */
export function headMatches(chain: readonly LedgerEntry[], anchoredHead: string): boolean {
  return (chain[chain.length - 1]?.hash ?? GENESIS_HASH) === anchoredHead;
}
