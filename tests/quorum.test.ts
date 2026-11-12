import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { computeQuorum, latestVotes, requiredVotes, type Vote } from '../src/core/quorum';

describe('requiredVotes', () => {
  it('pembulatan ke atas dengan bilangan bulat', () => {
    expect(requiredVotes(10, 70)).toBe(7);
    expect(requiredVotes(38, 70)).toBe(27); // 26.6 -> 27
    expect(requiredVotes(3, 50)).toBe(2);
    expect(requiredVotes(5, 0)).toBe(1); // minimal satu suara
    expect(requiredVotes(5, 100)).toBe(5);
    expect(requiredVotes(0, 70)).toBe(0);
  });
  it('property: dalam [1, n] dan monoton terhadap persen dan n', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 5000 }), fc.integer({ min: 0, max: 100 }), (n, p) => {
        const r = requiredVotes(n, p);
        expect(r).toBeGreaterThanOrEqual(1);
        expect(r).toBeLessThanOrEqual(n);
        if (p < 100) expect(requiredVotes(n, p + 1)).toBeGreaterThanOrEqual(r);
        expect(requiredVotes(n + 1, p)).toBeGreaterThanOrEqual(r);
        // sama dengan ceil eksak
        expect(r).toBe(Math.max(1, Math.ceil((n * p) / 100)));
      }),
    );
  });
});

describe('computeQuorum', () => {
  const v = (userId: string, stance: Vote['stance']): Vote => ({ userId, stance });
  it('suara terakhir per pengguna yang dipakai', () => {
    const votes = [v('a', 'keberatan'), v('b', 'setuju'), v('a', 'setuju')];
    expect(latestVotes(votes)).toHaveLength(2);
    const q = computeQuorum({ eligibleVoters: 3, quorumPercentage: 60, votes });
    expect(q).toMatchObject({ agree: 2, objections: 0, voted: 2, notVoted: 1, required: 2, reached: true, remaining: 0 });
  });
  it('tidak tercapai bila kurang; remaining benar', () => {
    const q = computeQuorum({ eligibleVoters: 10, quorumPercentage: 70, votes: [v('a', 'setuju'), v('b', 'setuju_dengan_catatan'), v('c', 'keberatan')] });
    expect(q).toMatchObject({ required: 7, agree: 2, objections: 1, reached: false, remaining: 5 });
  });
  it('blockOnObjection menahan kuorum yang jumlahnya cukup', () => {
    const votes = [v('a', 'setuju'), v('b', 'setuju'), v('c', 'keberatan')];
    expect(computeQuorum({ eligibleVoters: 3, quorumPercentage: 60, votes }).reached).toBe(true);
    const blocked = computeQuorum({ eligibleVoters: 3, quorumPercentage: 60, votes, blockOnObjection: true });
    expect(blocked.reached).toBe(false);
    expect(blocked.blockedByObjection).toBe(true);
  });
  it('tanpa pemilih berhak tidak pernah tercapai', () => {
    expect(computeQuorum({ eligibleVoters: 0, quorumPercentage: 70, votes: [v('a', 'setuju')] }).reached).toBe(false);
  });
  it('property: menambah suara setuju tidak pernah membatalkan kuorum; agree+objections = voted', () => {
    const stance = fc.constantFrom<Vote['stance']>('setuju', 'setuju_dengan_catatan', 'keberatan');
    fc.assert(
      fc.property(
        fc.array(fc.tuple(fc.integer({ min: 0, max: 30 }), stance), { maxLength: 40 }),
        fc.integer({ min: 1, max: 40 }),
        fc.integer({ min: 0, max: 100 }),
        (raw, eligible, pct) => {
          const votes = raw.map(([u, s]) => ({ userId: `u${u}`, stance: s }));
          const base = computeQuorum({ eligibleVoters: eligible, quorumPercentage: pct, votes });
          expect(base.agree + base.objections).toBe(base.voted);
          const extra = computeQuorum({ eligibleVoters: eligible, quorumPercentage: pct, votes: [...votes, { userId: 'baru-unik', stance: 'setuju' }] });
          return !base.reached || extra.reached;
        },
      ),
    );
  });
});
