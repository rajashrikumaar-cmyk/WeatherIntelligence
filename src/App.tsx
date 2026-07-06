import { useState, useEffect } from 'react';
import { WeatherData, PlanningRecommendation } from './types';
import { generateRecommendations } from './utils/weatherUtils';
import CitySearch from './components/CitySearch';
import CurrentWeatherPanel from './components/CurrentWeatherPanel';
import Forecast7Day from './components/Forecast7Day';
import PlanningRecommendations from './components/PlanningRecommendations';
import WeatherChat from './components/WeatherChat';
import * as Icons from 'lucide-react';

export default function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<PlanningRecommendation[]>([]);
  const [isCelsius, setIsCelsius] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default coordinate set to load immediately (New York City)
  useEffect(() => {
    handleSelectCity({
      name: 'New York',
      country: 'United States',
      lat: 40.7128,
      lon: -74.0060,
    });
  }, []);

  const handleSelectCity = async (city: { name: string; country: string; lat: number; lon: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=auto`
      );

      if (!response.ok) {
        throw new Error('Could not access weather intelligence models. Please try again.');
      }

      const data = await response.json();

      if (!data.current || !data.daily) {
        throw new Error('Incomplete weather analytics fetched from the weather stations.');
      }

      // Format WeatherData object
      const formattedWeather: WeatherData = {
        city: city.name,
        country: city.country,
        latitude: city.lat,
        longitude: city.lon,
        current: {
          time: data.current.time,
          temperature2m: data.current.temperature_2m,
          relativeHumidity2m: data.current.relative_humidity_2m,
          apparentTemperature: data.current.apparent_temperature,
          isDay: data.current.is_day === 1,
          precipitation: data.current.precipitation,
          rain: data.current.rain,
          showers: data.current.showers,
          snowfall: data.current.snowfall,
          weatherCode: data.current.weather_code,
          windSpeed10m: data.current.wind_speed_10m,
        },
        daily: data.daily.time.map((dateStr: string, idx: number) => ({
          date: dateStr,
          weatherCode: data.daily.weather_code[idx],
          tempMax: data.daily.temperature_2m_max[idx],
          tempMin: data.daily.temperature_2m_min[idx],
          precipitationSum: data.daily.precipitation_sum[idx],
          uvIndexMax: data.daily.uv_index_max[idx],
        })),
      };

      setWeather(formattedWeather);

      // Programmatically compute recommendations based on actual telemetry
      const generatedRecs = generateRecommendations(formattedWeather.current, formattedWeather.daily);
      setRecommendations(generatedRecs);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected telemetry error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUnits = () => {
    setIsCelsius((prev) => !prev);
  };

  return (
    <main className="min-h-screen relative bg-[#050507] pb-20 select-none overflow-hidden">
      {/* Frosted Glass Background Decor */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Decorative top background grid/ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03),transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 relative z-10">
        {/* Dynamic header row */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white font-display">
                Weather Intelligence<span className="text-blue-400">IQ</span>
              </h1>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                Advanced Weather-Driven Daily Activity Planner
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-zinc-500 text-right hidden md:block">
            <p>SATELLITE TELEMETRY NODE</p>
            <p className="text-white mt-0.5">ONLINE • CLOUDFLARE DEPLOYED</p>
          </div>
        </header>

        {/* City Search and Suggestions section */}
        <section className="glass-panel rounded-[24px] p-6 border-white/10">
          <CitySearch onSelectCity={handleSelectCity} isLoading={isLoading} />
        </section>

        {/* Main Dashboard Grid */}
        {error && (
          <div className="glass-panel border-red-500/20 bg-red-500/5 text-red-400 p-5 rounded-[24px] flex items-center gap-3 animate-in fade-in duration-300">
            <Icons.AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-sans">{error}</span>
          </div>
        )}

        {weather ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Current weather, 7-Day projections, and Planning Advisories */}
            <div className="lg:col-span-8 space-y-8">
              {/* Primary Current Weather Visual */}
              <CurrentWeatherPanel
                weather={weather}
                isCelsius={isCelsius}
                onToggleUnits={handleToggleUnits}
              />

              {/* Dynamic Planning Recommendations */}
              <PlanningRecommendations recommendations={recommendations} />

              {/* 7-Day strategic forecast */}
              <Forecast7Day dailyData={weather.daily} />
            </div>

            {/* Right Column: AI Assistant Chatbot */}
            <div className="lg:col-span-4 lg:sticky lg:top-8">
              <WeatherChat weather={weather} />
            </div>
          </div>
        ) : (
          !error && (
            <div className="h-96 flex flex-col items-center justify-center gap-3 animate-pulse">
              <Icons.Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
              <p className="text-sm font-mono text-zinc-500">Retrieving meteorological telemetry...</p>
            </div>
          )
        )}

        {/* Footer Stats Bar */}
        <footer className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-white/5 pt-6 text-[10px] uppercase tracking-[0.3em] text-white/20">
          <div>Satellite Status: <span className="text-emerald-500/60 font-bold">Active</span></div>
          <div>Open-Meteo API v1.2</div>
          <div>Data Latency: 142ms</div>
        </footer>
      </div>
    </main>
  );
}
