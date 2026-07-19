import { CardGridSkeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { useWeather, weatherLabel } from '@/data/useWeather';
import { CloudSun, Wind, Droplets, Sun, Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function PublicWeather() {
  const { data, loading, error } = useWeather();

  useEffect(() => {
    trackEvent('page_view', 'weather', 'Clima Uruaçu');
    // Basic SEO: title + description tags
    const oldTitle = document.title;
    document.title = 'Previsão do Tempo em Uruaçu — Clima Uruaçu Hoje | Rarques';
    const meta = document.querySelector('meta[name="description"]');
    const oldDesc = meta?.getAttribute('content');
    meta?.setAttribute(
      'content',
      'Clima em Uruaçu-GO hoje: temperatura, condição do tempo, previsão para 7 dias, índice UV e chance de chuva. Atualizado em tempo real.',
    );
    return () => {
      document.title = oldTitle;
      if (oldDesc) meta?.setAttribute('content', oldDesc);
    };
  }, []);

  return (
    <div className="animate-fadeUp pb-4">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-white mb-1">Clima em Uruaçu</h1>
        <p className="text-gray-400 text-sm">Previsão do tempo atualizada para Uruaçu — GO</p>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Carregando previsão…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-950/40 border border-red-900 p-4 text-red-300 text-sm">
          Não foi possível carregar os dados do clima. Tente novamente em instantes.
        </div>
      )}

      {data && (
        <>
          <div className="bg-gradient-to-br from-[#0b1a3a] to-black border border-yellow-500/30 p-5 mb-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-yellow-400 text-[11px] font-semibold tracking-widest mb-1">AGORA</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white text-5xl font-bold">
                    {Math.round(data.now.temperature)}°
                  </span>
                  <span className="text-gray-300 text-sm">C</span>
                </div>
                <p className="text-gray-200 text-sm mt-1">{weatherLabel(data.now.weatherCode)}</p>
              </div>
              <CloudSun size={64} className="text-yellow-400 opacity-80" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Metric
                icon={<Sun size={14} />}
                label="Índice UV"
                value={data.now.uv != null ? data.now.uv.toFixed(1) : '—'}
              />
              <Metric
                icon={<Droplets size={14} />}
                label="Chance chuva"
                value={
                  data.now.precipitationProbability != null
                    ? `${data.now.precipitationProbability}%`
                    : '—'
                }
              />
              <Metric
                icon={<Wind size={14} />}
                label="Vento"
                value={`${Math.round(data.now.windSpeed)} km/h`}
              />
            </div>
          </div>

          <h2 className="text-white font-semibold text-sm tracking-wide mb-3">PRÓXIMOS 7 DIAS</h2>
          <div className="grid grid-cols-1 gap-2">
            {data.forecast.map((d) => {
              const dt = new Date(d.date + 'T12:00:00');
              return (
                <div
                  key={d.date}
                  className="flex items-center justify-between bg-gray-900 border border-gray-800 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-white text-sm font-semibold w-10">
                      {DIAS[dt.getDay()]}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                    <span className="text-gray-300 text-xs hidden sm:inline">
                      {weatherLabel(d.weatherCode)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-blue-300 inline-flex items-center gap-1">
                      <Droplets size={12} /> {d.precipitationProbability}%
                    </span>
                    <span className="text-yellow-400 inline-flex items-center gap-1">
                      <Sun size={12} /> {d.uvMax.toFixed(0)}
                    </span>
                    <span className="text-white">
                      <span className="font-semibold">{Math.round(d.tempMax)}°</span>
                      <span className="text-gray-500"> / {Math.round(d.tempMin)}°</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-gray-500 mt-4 text-center">
            Fonte: Open-Meteo — atualizado em tempo real.
          </p>
        </>
      )}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-black/30 border border-white/10 px-2 py-2">
      <div className="text-gray-400 text-[10px] tracking-wide flex items-center gap-1">
        {icon} {label}
      </div>
      <div className="text-white text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}
