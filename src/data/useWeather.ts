import { useEffect, useState } from 'react';

// Uruaçu-GO coordinates
export const URUACU_LAT = -14.5236;
export const URUACU_LON = -49.1406;

export interface WeatherNow {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  isDay: boolean;
  uv: number | null;
  precipitationProbability: number | null;
}

export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitationProbability: number;
  uvMax: number;
}

export interface WeatherData {
  now: WeatherNow;
  forecast: WeatherDay[];
}

// Open-Meteo — free, no API key required
const URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${URUACU_LAT}&longitude=${URUACU_LON}` +
  `&current=temperature_2m,is_day,weather_code,wind_speed_10m,precipitation_probability` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max` +
  `&hourly=uv_index` +
  `&forecast_days=7&timezone=America%2FSao_Paulo`;

export function weatherLabel(code: number): string {
  if ([0].includes(code)) return 'Céu limpo';
  if ([1, 2].includes(code)) return 'Parcialmente nublado';
  if ([3].includes(code)) return 'Nublado';
  if ([45, 48].includes(code)) return 'Névoa';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Garoa';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Chuva';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Neve';
  if ([95, 96, 99].includes(code)) return 'Trovoada';
  return '—';
}

export function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        const currentUvIndex = (() => {
          const hourly = json.hourly;
          if (!hourly?.time || !hourly?.uv_index) return null;
          const now = new Date();
          const idx = hourly.time.findIndex((t: string) => {
            const d = new Date(t);
            return d.getHours() === now.getHours() && d.getDate() === now.getDate();
          });
          return idx >= 0 ? hourly.uv_index[idx] : null;
        })();
        setData({
          now: {
            temperature: json.current.temperature_2m,
            weatherCode: json.current.weather_code,
            windSpeed: json.current.wind_speed_10m,
            isDay: json.current.is_day === 1,
            uv: currentUvIndex,
            precipitationProbability: json.current.precipitation_probability ?? null,
          },
          forecast: json.daily.time.map((date: string, i: number) => ({
            date,
            tempMax: json.daily.temperature_2m_max[i],
            tempMin: json.daily.temperature_2m_min[i],
            weatherCode: json.daily.weather_code[i],
            precipitationProbability: json.daily.precipitation_probability_max[i],
            uvMax: json.daily.uv_index_max[i],
          })),
        });
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Erro');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
