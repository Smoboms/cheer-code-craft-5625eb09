import { Link } from 'react-router-dom';
import { CloudSun, ArrowRight } from 'lucide-react';
import { useWeather, weatherLabel } from '@/data/useWeather';

export function WeatherHomeBlock() {
  const { data, loading } = useWeather();

  return (
    <div className="bg-gray-900 border border-gray-800 px-3 py-2.5 flex items-center justify-between gap-3 h-full">
      <div className="flex items-center gap-2.5 min-w-0">
        <CloudSun size={22} className="text-yellow-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 leading-none">Clima em Uruaçu agora</p>
          {loading || !data ? (
            <p className="text-gray-300 text-xs mt-1">Carregando…</p>
          ) : (
            <p className="text-white text-sm font-semibold leading-tight mt-0.5">
              {Math.round(data.now.temperature)}°C
              <span className="text-gray-400 font-normal"> · {weatherLabel(data.now.weatherCode)}</span>
            </p>
          )}
        </div>
      </div>
      <Link
        to="/clima-uruacu"
        className="shrink-0 text-[11px] text-yellow-400 hover:text-yellow-300 font-semibold inline-flex items-center gap-1"
      >
        Ver previsão completa <ArrowRight size={11} />
      </Link>
    </div>
  );
}
