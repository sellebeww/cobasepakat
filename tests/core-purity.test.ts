import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const dir = path.resolve(import.meta.dirname, '../src/core');

describe('src/core murni', () => {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ts'));
  it('ada modul untuk diperiksa', () => expect(files.length).toBeGreaterThan(5));
  for (const f of files) {
    it(`${f} tidak mengimpor React, DOM, Supabase, atau modul di luar core`, () => {
      const src = fs.readFileSync(path.join(dir, f), 'utf8');
      const imports = [...src.matchAll(/(?:import|export)[^'"]*from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const i of imports) expect(i.startsWith('./'), `${f} mengimpor ${i}`).toBe(true);
      expect(src).not.toMatch(/\b(window|document|localStorage|sessionStorage|navigator)\b/);
      expect(src).not.toMatch(/Math\.random\(|Date\.now\(|new Date\(\)/); // deterministik: waktu disuntik
    });
  }
});
