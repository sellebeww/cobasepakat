export type VoteStance = 'setuju' | 'setuju_dengan_catatan' | 'keberatan';

export interface Vote {
  userId: string;
  stance: VoteStance;
}

export interface QuorumInput {
  /** Jumlah pemilih yang berhak (anggota ruang berperan peserta). */
  eligibleVoters: number;
  /** Persentase kuorum 0..100. */
  quorumPercentage: number;
  votes: readonly Vote[];
  /** Bila true, satu keberatan terbuka menahan kuorum walau jumlah setuju cukup. Default false. */
  blockOnObjection?: boolean;
}

export interface QuorumResult {
  required: number;
  agree: number;
  objections: number;
  voted: number;
  notVoted: number;
  reached: boolean;
  /** Kuorum jumlahnya cukup tetapi tertahan oleh keberatan (hanya bila blockOnObjection). */
  blockedByObjection: boolean;
  /** Berapa suara setuju lagi yang masih dibutuhkan. */
  remaining: number;
}

/** Jumlah suara setuju minimum: ceil(pemilih * persen / 100), dihitung dengan bilangan bulat. */
export function requiredVotes(eligibleVoters: number, quorumPercentage: number): number {
  const n = Math.max(0, Math.trunc(eligibleVoters));
  const p = Math.min(100, Math.max(0, Math.trunc(quorumPercentage)));
  if (n === 0) return 0;
  return Math.max(1, Math.min(n, Math.floor((n * p + 99) / 100)));
}

/** Suara terakhir tiap pengguna yang dipakai (urutan array = urutan waktu). */
export function latestVotes(votes: readonly Vote[]): Vote[] {
  const last = new Map<string, Vote>();
  for (const v of votes) last.set(v.userId, v);
  return [...last.values()];
}

export function computeQuorum(input: QuorumInput): QuorumResult {
  const required = requiredVotes(input.eligibleVoters, input.quorumPercentage);
  const votes = latestVotes(input.votes);
  const agree = votes.filter((v) => v.stance !== 'keberatan').length;
  const objections = votes.length - agree;
  const enough = required > 0 && agree >= required;
  const blockedByObjection = enough && !!input.blockOnObjection && objections > 0;
  return {
    required,
    agree,
    objections,
    voted: votes.length,
    notVoted: Math.max(0, Math.trunc(input.eligibleVoters) - votes.length),
    reached: enough && !blockedByObjection,
    blockedByObjection,
    remaining: Math.max(0, required - agree),
  };
}
