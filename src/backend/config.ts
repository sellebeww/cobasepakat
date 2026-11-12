export interface BackendEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

/** Mode tim aktif hanya bila URL https dan kunci anon terisi. Selain itu aplikasi berjalan sebagai demo lokal. */
export function backendConfig(env: BackendEnv): { url: string; anonKey: string } | null {
  const url = env.VITE_SUPABASE_URL?.trim();
  const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') return null;
  } catch {
    return null;
  }
  return { url, anonKey };
}
