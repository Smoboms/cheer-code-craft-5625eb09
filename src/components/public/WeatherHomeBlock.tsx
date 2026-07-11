import { Link } from 'react-router-dom';
import { CloudSun, ArrowRight } from 'lucide-react';
import { useWeather, weatherLabel } from '@/data/useWeather';

export function WeatherHomeBlock() {
  const { data, loading } = useWeather();

  return (
    <Link
      to="/clima-uruacu"
      className="flex items-center justify-between gap-3 bg-gray-900 border border-gray-800 hover:border-yellow-500/50 transition-colors px-3 py-2 mb-4"
    >
      <div className="flex items-center gap-2 min-w-0">
        <CloudSun size={18} className="text-yellow-400 shrink-0" />
        <p className="text-xs text-gray-300 truncate">
          {loading || !data ? (
            <>Clima em Uruaçu agora…</>
          ) : (
            <>
              <span className="text-white font-semibold">Clima em Uruaçu:</span>{' '}
              {Math.round(data.now.temperature)}°C — {weatherLabel(data.now.weatherCode)}
            </>
          )}
        </p>
      </div>
      <span className="text-[11px] text-yellow-400 font-semibold inline-flex items-center gap-1 shrink-0">
        Ver previsão <ArrowRight size={11} />
      </span>
    </Link>
  );
}
