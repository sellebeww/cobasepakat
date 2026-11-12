import { CheckCircle2, CircleHelp, XCircle } from 'lucide-react';
import type { Verdict } from '../../core';

const CONFIG: Record<Verdict, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  terpenuhi: { label: 'Terpenuhi (menurut data)', cls: 'bg-emerald-50 text-emerald-900 border-emerald-300', Icon: CheckCircle2 },
  tidak_terpenuhi: { label: 'Tidak terpenuhi (menurut data)', cls: 'bg-red-50 text-red-900 border-red-300', Icon: XCircle },
  belum_dapat_disimpulkan: { label: 'Belum dapat disimpulkan', cls: 'bg-amber-50 text-amber-900 border-amber-300', Icon: CircleHelp },
};

/** Status selalu berupa ikon + teks, tidak hanya warna. */
export function VerdictBadge({ verdict, className = '' }: { verdict: Verdict; className?: string }) {
  const { label, cls, Icon } = CONFIG[verdict];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${cls} ${className}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}
