import { WeatherData } from '../types';
import { getWeatherCondition } from '../utils/weatherUtils';
import WeatherBackground from './WeatherBackground';
import * as Icons from 'lucide-react';

interface CurrentWeatherPanelProps {
  weather: WeatherData;
  isCelsius: boolean;
  onToggleUnits: () => void;
}

export default function CurrentWeatherPanel({ weather, isCelsius, onToggleUnits }: CurrentWeatherPanelProps) {
  const { current, daily } = weather;
  const condition = getWeatherCondition(current.weatherCode, current.isDay);

  const formatTemp = (tempC: number) => {
    if (isCelsius) {
      return `${Math.round(tempC)}°C`;
    }
    const tempF = (tempC * 9) / 5 + 32;
    return `${Math.round(tempF)}°F`;
  };

  const formatWind = (speedKmh: number) => {
    if (isCelsius) {
      return `${speedKmh.toFixed(1)} km/h`;
    }
    const speedMph = speedKmh * 0.621371;
    return `${speedMph.toFixed(1)} mph`;
  };

  // Map icon name string to Lucide React component
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Sun': return Icons.Sun;
      case 'Moon': return Icons.Moon;
      case 'CloudSun': return Icons.CloudSun;
      case 'CloudMoon': return Icons.CloudMoon;
      case 'Cloud': return Icons.Cloud;
      case 'CloudFog': return Icons.CloudFog;
      case 'CloudDrizzle': return Icons.CloudDrizzle;
      case 'CloudSnow': return Icons.Snowflake;
      case 'CloudRain': return Icons.CloudRain;
      case 'Snowflake': return Icons.Snowflake;
      case 'CloudLightning': return Icons.CloudLightning;
      default: return Icons.HelpCircle;
    }
  };

  const WeatherIcon = getIconComponent(condition.iconName);
  const uvMax = daily[0]?.uvIndexMax || 0;

  // Visual glows and coloring based on weather code
  const isSun = current.weatherCode === 0;
  const isRain = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(current.weatherCode);
  const isStorm = [95, 96, 99].includes(current.weatherCode);

  let highlightColor = 'text-white';
  let badgeColor = 'bg-white/5 border-white/10';
  let accentBorder = 'border-white/10';

  if (isSun) {
    highlightColor = 'text-amber-400';
    badgeColor = 'bg-amber-500/10 border-amber-500/20 text-amber-300';
    accentBorder = 'border-amber-500/20';
  } else if (isRain) {
    highlightColor = 'text-cyan-400';
    badgeColor = 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300';
    accentBorder = 'border-cyan-500/20';
  } else if (isStorm) {
    highlightColor = 'text-purple-400';
    badgeColor = 'bg-purple-500/10 border-purple-500/20 text-purple-300';
    accentBorder = 'border-purple-500/20';
  }

  return (
    <div className="glass-panel rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[440px] border-white/10">
      {/* Particle background for Rain, Sun, Storm */}
      <WeatherBackground weatherCode={current.weatherCode} />

      {/* Foreground Content */}
      <div className="relative z-10 space-y-6">
        {/* City and Location Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xs font-mono font-medium tracking-widest text-zinc-500 flex items-center gap-1.5 uppercase">
              <Icons.Navigation className="w-3.5 h-3.5 animate-pulse" />
              Active Coordinates
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                {weather.city}
              </h2>
              <span className="text-sm text-zinc-400 font-medium">
                {weather.country}
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-500">
              Lat: {weather.latitude.toFixed(4)}° • Lon: {weather.longitude.toFixed(4)}°
            </p>
          </div>

          {/* Metric / Imperial toggle switch */}
          <button
            onClick={onToggleUnits}
            className="text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all duration-200"
          >
            {isCelsius ? 'Metric °C' : 'Imperial °F'}
          </button>
        </div>

        {/* Temperature & Large Visual Representation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4">
          <div className="flex items-baseline gap-1.5">
            <h1 className="text-7xl sm:text-8xl font-display font-extrabold text-white tracking-tighter leading-none select-none">
              {isCelsius ? Math.round(current.temperature2m) : Math.round((current.temperature2m * 9) / 5 + 32)}
            </h1>
            <span className="text-3xl sm:text-4xl font-display font-light text-zinc-400 leading-none">
              {isCelsius ? '°C' : '°F'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Elegant weather code visual badge */}
            <div className={`p-4 rounded-2xl bg-neutral-900/50 border ${accentBorder} backdrop-blur-md`}>
              <WeatherIcon className={`w-12 h-12 ${highlightColor} animate-float`} />
            </div>

            <div className="space-y-1">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeColor}`}>
                {condition.label}
              </span>
              <p className="text-sm text-zinc-400 font-sans pl-1 pt-1">
                Feels like <span className="text-white font-medium">{formatTemp(current.apparentTemperature)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-panel stats cards */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5">
        {/* Stat 1: Wind */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400">
            <Icons.Wind className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Wind Velocity</span>
            <p className="text-sm font-semibold text-white mt-0.5">{formatWind(current.windSpeed10m)}</p>
          </div>
        </div>

        {/* Stat 2: Humidity */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400">
            <Icons.Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Rel. Humidity</span>
            <p className="text-sm font-semibold text-white mt-0.5">{current.relativeHumidity2m}%</p>
          </div>
        </div>

        {/* Stat 3: Precipitation */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-cyan-400 bg-cyan-500/5 border-cyan-500/10">
            <Icons.CloudRain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Precipitation</span>
            <p className="text-sm font-semibold text-white mt-0.5">{current.precipitation.toFixed(1)} mm</p>
          </div>
        </div>

        {/* Stat 4: UV Index */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400">
            <Icons.Sun className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">UV Level</span>
            <p className="text-sm font-semibold text-white mt-0.5">
              {uvMax.toFixed(1)} <span className="text-[10px] text-zinc-500 font-normal">Max</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
