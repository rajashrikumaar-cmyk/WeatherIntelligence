export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code?: string;
  admin1?: string;
  elevation?: number;
  timezone?: string;
}

export interface CurrentWeatherData {
  time: string;
  temperature2m: number;
  relativeHumidity2m: number;
  apparentTemperature: number;
  isDay: boolean;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weatherCode: number;
  windSpeed10m: number;
}

export interface DailyForecastDay {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  uvIndexMax: number;
}

export interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  current: CurrentWeatherData;
  daily: DailyForecastDay[];
}

export interface PlanningRecommendation {
  category: string;
  title: string;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Not Recommended';
  score: number; // 0 - 100
  color: string; // Tailwind color class
  details: string;
  itemsToBring: string[];
}

export interface WeatherConditionConfig {
  label: string;
  iconName: string;
  themeColor: string; // Tailwind hex or class prefix
  textColor: string;
  glowColor: string;
  bgGradient: string;
}
