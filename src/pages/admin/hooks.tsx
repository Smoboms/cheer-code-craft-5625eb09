import { useEffect, useMemo, useState } from 'react';

export type Period = '1d' | '7d' | '30d' | 'custom';

export function useDateRange(defaultPeriod: Period = '30d') {
  const [period, setPeriod] = useState<Period>(defaultPeriod);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const range = useMemo(() => {
    const now = new Date();
    let from = new Date(now);
    if (period === '1d') from.setDate(now.getDate() - 1);
    else if (period === '7d') from.setDate(now.getDate() - 7);
    else if (period === '30d') from.setDate(now.getDate() - 30);
    else if (period === 'custom' && customFrom) from = new Date(customFrom);
    const to = period === 'custom' && customTo ? new Date(customTo) : now;
    return { from: from.toISOString(), to: to.toISOString() };
  }, [period, customFrom, customTo]);
  return { period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo, range };
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fn().then(d => { if (mounted) { setData(d); setError(null); } })
      .catch(e => { if (mounted) setError(e?.message || 'Erro'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { data, loading, error, reload: () => setTick(t => t + 1) };
}

export function PeriodPicker({ period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo }: ReturnType<typeof useDateRange>) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {(['1d','7d','30d','custom'] as const).map(p => (
        <button key={p} onClick={() => setPeriod(p)}
          className={`px-3 py-1.5 text-xs uppercase tracking-wider border ${period===p?'bg-yellow-500 text-black border-yellow-500':'border-white/15 text-gray-300 hover:bg-white/5'}`}>
          {p==='1d'?'Hoje':p==='7d'?'7 dias':p==='30d'?'30 dias':'Personalizado'}
        </button>
      ))}
      {period === 'custom' && (
        <>
          <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} className="bg-[#0a0f1e] border border-white/15 text-white text-xs px-2 py-1.5" />
          <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} className="bg-[#0a0f1e] border border-white/15 text-white text-xs px-2 py-1.5" />
        </>
      )}
    </div>
  );
}
