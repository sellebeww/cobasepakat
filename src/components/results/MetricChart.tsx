import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MetricEstimate } from '../../core';
import { useI18n } from '../../i18n';
import { fmt } from './format';

/**
 * Grafik rata-rata harian dengan garis dasar, ambang, dan pita interval kepercayaan keseluruhan.
 * Aksesibilitas: berupa gambar bernama (role="img") dengan ringkasan teks, ditambah tabel data setara.
 * Pita interval dan ukuran sampel (jumlah hari, jumlah pengamatan) selalu ditampilkan.
 */
export function MetricChart({ est, height = 180 }: { est: MetricEstimate; height?: number }) {
  const { t } = useI18n();
  const { metric, series, interval } = est;
  const data = series.daily.map((d) => ({ day: d.day, value: Number(d.value.toFixed(4)), count: d.count }));
  const summary =
    data.length === 0
      ? `Belum ada data untuk ${metric.name}.`
      : `Grafik ${metric.name}: ${data.length} hari berdata, ${series.observations} pengamatan. Rata-rata ${fmt(est.estimate)} ${metric.unit}${
          interval ? `, interval 95% ${fmt(interval.lower)} sampai ${fmt(interval.upper)}` : ', interval belum dapat dihitung'
        }. Garis dasar ${fmt(metric.baselineValue)}, ambang ${fmt(metric.thresholdValue)}.`;

  return (
    <figure className="space-y-2">
      <div role="img" aria-label={summary} style={{ height }} className="w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl bg-brand-surface text-xs text-brand-slate">{t('chart.nodata')}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} label={{ value: t('chart.day').trim(), position: 'insideBottomRight', offset: -2, fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} width={44} domain={['auto', 'auto']} />
              {interval && <ReferenceArea y1={interval.lower} y2={interval.upper} fill="#2272E8" fillOpacity={0.12} />}
              <ReferenceLine y={metric.baselineValue} stroke="#64748b" strokeDasharray="6 3" label={{ value: 'Garis dasar', fontSize: 11, position: 'insideTopLeft' }} />
              <ReferenceLine y={metric.thresholdValue} stroke="#2FA882" strokeDasharray="2 2" label={{ value: 'Ambang', fontSize: 11, position: 'insideBottomLeft' }} />
              <Tooltip formatter={(v) => `${fmt(Number(v))} ${metric.unit}`} labelFormatter={(l) => `${t('chart.day')}${l}`} />
              <Line type="monotone" dataKey="value" stroke="#153A73" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <figcaption className="text-xs text-brand-slate">
        {t('chart.caption', { days: data.length, obs: series.observations })}
      </figcaption>
      {data.length > 0 && (
        <details className="text-xs text-brand-slate">
          <summary className="cursor-pointer font-semibold text-brand-navy">{t('chart.table')}</summary>
          <table className="mt-1 w-full text-left">
            <caption className="sr-only">Rata-rata harian {metric.name}</caption>
            <thead>
              <tr>
                <th scope="col" className="pr-3">Hari ke-</th>
                <th scope="col" className="pr-3">Rata-rata ({metric.unit})</th>
                <th scope="col">Pengamatan</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.day}>
                  <th scope="row" className="pr-3 font-normal">{d.day}</th>
                  <td className="pr-3 font-mono">{fmt(d.value)}</td>
                  <td className="font-mono">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </figure>
  );
}
