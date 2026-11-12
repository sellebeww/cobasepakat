import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { buildInviteUrl, createInviteToken, hashInviteToken, INVITE_TOKEN_PATTERN, inviteState, parseInviteHash } from '../src/core/invite';

describe('invite', () => {
  it('token acak: 32 karakter URL-safe, unik', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const t = createInviteToken();
      expect(t).toMatch(INVITE_TOKEN_PATTERN);
      seen.add(t);
    }
    expect(seen.size).toBe(200);
  });
  it('sumber acak deterministik menghasilkan token deterministik', () => {
    expect(createInviteToken(() => new Uint8Array(24))).toBe('A'.repeat(32));
    expect(createInviteToken(() => new Uint8Array(24).fill(255))).toBe('_'.repeat(32));
  });
  it('property: token mana pun dari 24 byte cocok pola dan bolak-balik lewat URL', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 24, maxLength: 24 }), (bytes) => {
        const t = createInviteToken(() => bytes);
        expect(t).toMatch(INVITE_TOKEN_PATTERN);
        const url = buildInviteUrl('https://cobasepakat.example/', t);
        expect(url.startsWith('https://cobasepakat.example/#/join/')).toBe(true);
        expect(parseInviteHash(url.slice(url.indexOf('#')))).toBe(t);
      }),
    );
  });
  it('hash token stabil, berbeda dari token, dan tidak membocorkan token', async () => {
    const t = createInviteToken();
    const h = await hashInviteToken(t);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toContain(t);
    expect(await hashInviteToken(t)).toBe(h);
    expect(await hashInviteToken(`${t.slice(0, -1)}A`)).not.toBe(h);
  });
  it('parseInviteHash menolak bentuk salah', () => {
    expect(parseInviteHash('#/join/pendek')).toBeNull();
    expect(parseInviteHash('#/demo/beranda')).toBeNull();
    expect(parseInviteHash(`#/join/${'A'.repeat(32)}/ekstra`)).toBeNull();
    expect(parseInviteHash(`#/join/${'A'.repeat(32)}`)).toBe('A'.repeat(32));
  });
  it('inviteState', () => {
    const inv = { expiresAt: '2026-11-20T00:00:00Z', maxUses: 2, usedCount: 0 };
    expect(inviteState(inv, '2026-11-12T00:00:00Z')).toBe('valid');
    expect(inviteState(inv, '2026-11-20T00:00:00Z')).toBe('kedaluwarsa');
    expect(inviteState({ ...inv, usedCount: 2 }, '2026-11-12T00:00:00Z')).toBe('habis');
    expect(inviteState({ ...inv, revokedAt: '2026-11-13T00:00:00Z' }, '2026-11-12T00:00:00Z')).toBe('dicabut');
    expect(inviteState({ ...inv, expiresAt: 'rusak' }, '2026-11-12T00:00:00Z')).toBe('kedaluwarsa');
  });
});
