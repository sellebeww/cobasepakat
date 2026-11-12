import { sha256Hex } from './ledger';

export type InviteRole = 'participant' | 'observer';

export interface InviteRecord {
  tokenHash: string;
  role: InviteRole;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  revokedAt?: string | null;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function base64Url(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out += ALPHABET[(n >> 18) & 63] + ALPHABET[(n >> 12) & 63] + ALPHABET[(n >> 6) & 63] + ALPHABET[n & 63];
  }
  const rest = bytes.length - i;
  if (rest === 1) {
    const n = bytes[i] << 16;
    out += ALPHABET[(n >> 18) & 63] + ALPHABET[(n >> 12) & 63];
  } else if (rest === 2) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8);
    out += ALPHABET[(n >> 18) & 63] + ALPHABET[(n >> 12) & 63] + ALPHABET[(n >> 6) & 63];
  }
  return out;
}

export const INVITE_TOKEN_BYTES = 24;
export const INVITE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32}$/;

/** Token undangan acak 192 bit (32 karakter URL-safe). Sumber acak dapat disuntik untuk test. */
export function createInviteToken(
  random: (n: number) => Uint8Array = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n)),
): string {
  return base64Url(random(INVITE_TOKEN_BYTES));
}

/** Server hanya menyimpan hash token; token mentah hanya ada di tautan. */
export function hashInviteToken(token: string): Promise<string> {
  return sha256Hex(`cobasepakat-invite:${token}`);
}

export function buildInviteUrl(origin: string, token: string): string {
  return `${origin.replace(/\/+$/, '')}/#/join/${token}`;
}

/** Ambil token dari hash URL '#/join/<token>'. Null bila bentuknya salah. */
export function parseInviteHash(hash: string): string | null {
  const m = /^#\/join\/([^/?#]+)$/.exec(hash);
  if (!m) return null;
  return INVITE_TOKEN_PATTERN.test(m[1]) ? m[1] : null;
}

export type InviteState = 'valid' | 'kedaluwarsa' | 'dicabut' | 'habis';

export function inviteState(inv: Pick<InviteRecord, 'expiresAt' | 'maxUses' | 'usedCount' | 'revokedAt'>, now: string): InviteState {
  if (inv.revokedAt) return 'dicabut';
  const exp = Date.parse(inv.expiresAt);
  const t = Date.parse(now);
  if (Number.isNaN(exp) || Number.isNaN(t) || t >= exp) return 'kedaluwarsa';
  if (inv.usedCount >= inv.maxUses) return 'habis';
  return 'valid';
}
