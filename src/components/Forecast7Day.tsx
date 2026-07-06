import { DailyForecastDay } from '../types';
import { getWeatherCondition } from '../utils/weatherUtils';
import * as Icons from 'lucide-react';

interface Forecast7DayProps {
  dailyData: DailyForecastDay[];
}

export default function Forecast7Day({ dailyData }: Forecast7DayProps) {
  // Find global min and max temperature for the visual range bars
  const allMaxs = dailyData.map((d) => d.tempMax);
  const allMins = dailyData.map((d) => d.tempMin);
  const absoluteMax = Math.max(...allMaxs);
  const absoluteMin = Math.min(...allMins);
  const tempSpread = absoluteMax - absoluteMin || 1;

  function formatDayName(dateStr: string, index: number) {
    if (index === 0) return 'Today';
    const date = new Date(dateStr + 'T00:00:00Z'); // prevent local timezone shift
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
  }

  // Helper to map icon name string to Lucide React component
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

  const getUVBadgeColor = (uv: number) => {
    if (uv <= 2) return 'text-green-400 border-green-500/20 bg-green-500/5';
    if (uv <= 5) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    if (uv <= 7) return 'text-orange-400 border-orange-500/20 bg-orange-500/5';
    return 'text-red-400 border-red-500/20 bg-red-500/5';
  };

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h3 className="text-base font-display font-bold text-white tracking-tight flex items-center gap-2">
          <Icons.Calendar className="w-4 h-4 text-zinc-400" />
          7-Day Strategic Forecast
        </h3>
        <span className="text-xs font-mono text-zinc-500">PROJECTIONS</span>
      </div>

      <div className="space-y-4">
        {dailyData.map((day, idx) => {
          const condition = getWeatherCondition(day.weatherCode, true);
          const WeatherIcon = getIconComponent(condition.iconName);

          // Calculate visual temperature bar percentages
          const leftPercent = ((day.tempMin - absoluteMin) / tempSpread) * 100;
          const barWidthPercent = ((day.tempMax - day.tempMin) / tempSpread) * 100;

          // Check if precipitation exists
          const hasRain = day.precipitationSum > 0;

          return (
            <div
              key={day.date}
              id={`forecast-row-${idx}`}
              className="grid grid-cols-12 items-center gap-2 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] -mx-4 px-4 rounded-xl transition-all duration-200"
            >
              {/* Day Name */}
              <div className="col-span-3 text-sm font-medium text-zinc-300">
                {formatDayName(day.date, idx)}
              </div>

              {/* Weather Condition Icon & Label */}
              <div className="col-span-3 flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 ${condition.textColor}`}>
                  <WeatherIcon className="w-4 h-4" />
                </div>
                <span className="text-xs text-zinc-400 hidden sm:inline truncate max-w-[80px]">
                  {condition.label}
                </span>
              </div>

              {/* Precipitation */}
              <div className="col-span-2 flex items-center gap-1 text-xs">
                {hasRain ? (
                  <span className="text-cyan-400 font-medium flex items-center gap-0.5">
                    <Icons.Droplets className="w-3 h-3 text-cyan-400" />
                    {day.precipitationSum.toFixed(1)}<span className="text-[9px] text-cyan-400/70">mm</span>
                  </span>
                ) : (
                  <span className="text-zinc-600 font-mono">—</span>
                )}
              </div>

              {/* Min & Max Visual Temperature Spread Bar */}
              <div className="col-span-3 flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-500 w-6 text-right">
                  {Math.round(day.tempMin)}°
                </span>
                <div className="flex-1 bg-white/5 h-1.5 rounded-full relative overflow-hidden border border-white/[0.03]">
                  <div
                    className="absolute h-full bg-white rounded-full opacity-60"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${Math.max(8, barWidthPercent)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-white font-semibold w-6">
                  {Math.round(day.tempMax)}°
                </span>
              </div>

              {/* UV Max Badge */}
              <div className="col-span-1 flex justify-end">
                <div
                  className={`text-[9px] font-semibold font-mono w-5 h-5 flex items-center justify-center rounded-full border ${getUVBadgeColor(
                    day.uvIndexMax
                  )}`}
                  title={`UV Index: ${day.uvIndexMax}`}
                >
                  {Math.round(day.uvIndexMax)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
