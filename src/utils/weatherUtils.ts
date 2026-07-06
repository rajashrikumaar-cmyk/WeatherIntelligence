import { CurrentWeatherData, DailyForecastDay, PlanningRecommendation, WeatherConditionConfig } from '../types';

export function getWeatherCondition(code: number, isDay: boolean = true): WeatherConditionConfig {
  // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
  switch (code) {
    case 0: // Clear sky
      return {
        label: isDay ? 'Sunny' : 'Clear Night',
        iconName: isDay ? 'Sun' : 'Moon',
        themeColor: '#f59e0b', // Amber
        textColor: 'text-amber-400',
        glowColor: 'rgba(245, 158, 11, 0.25)',
        bgGradient: 'from-amber-500/10 via-transparent to-transparent',
      };
    case 1: // Mainly clear
    case 2: // Partly cloudy
      return {
        label: 'Partly Cloudy',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
        themeColor: '#a1a1aa', // Zinc
        textColor: 'text-zinc-300',
        glowColor: 'rgba(255, 255, 255, 0.1)',
        bgGradient: 'from-zinc-500/5 via-transparent to-transparent',
      };
    case 3: // Overcast
      return {
        label: 'Overcast',
        iconName: 'Cloud',
        themeColor: '#71717a', // Zinc darker
        textColor: 'text-zinc-400',
        glowColor: 'rgba(113, 113, 122, 0.08)',
        bgGradient: 'from-zinc-700/5 via-transparent to-transparent',
      };
    case 45: // Fog
    case 48: // Depositing rime fog
      return {
        label: 'Foggy',
        iconName: 'CloudFog',
        themeColor: '#64748b', // Slate
        textColor: 'text-slate-400',
        glowColor: 'rgba(100, 116, 139, 0.08)',
        bgGradient: 'from-slate-500/5 via-transparent to-transparent',
      };
    case 51: // Drizzle: Light
    case 53: // Drizzle: Moderate
    case 55: // Drizzle: Dense
      return {
        label: 'Drizzle',
        iconName: 'CloudDrizzle',
        themeColor: '#06b6d4', // Cyan
        textColor: 'text-cyan-400',
        glowColor: 'rgba(6, 182, 212, 0.2)',
        bgGradient: 'from-cyan-500/10 via-transparent to-transparent',
      };
    case 56: // Freezing Drizzle: Light
    case 57: // Freezing Drizzle: Dense intensity
    case 66: // Freezing Rain: Light
    case 67: // Freezing Rain: Heavy intensity
      return {
        label: 'Freezing Rain',
        iconName: 'CloudSnow',
        themeColor: '#3b82f6', // Blue
        textColor: 'text-blue-400',
        glowColor: 'rgba(59, 130, 246, 0.2)',
        bgGradient: 'from-blue-500/10 via-transparent to-transparent',
      };
    case 61: // Rain: Slight
    case 63: // Rain: Moderate
    case 65: // Rain: Heavy intensity
    case 80: // Rain showers: Slight
    case 81: // Rain showers: Moderate
    case 82: // Rain showers: Violent
      return {
        label: 'Rainy',
        iconName: 'CloudRain',
        themeColor: '#0ea5e9', // Sky Blue
        textColor: 'text-sky-400',
        glowColor: 'rgba(14, 165, 233, 0.25)',
        bgGradient: 'from-sky-500/15 via-transparent to-transparent',
      };
    case 71: // Snow fall: Slight
    case 73: // Snow fall: Moderate
    case 75: // Snow fall: Heavy intensity
    case 77: // Snow grains
    case 85: // Snow showers: Slight
    case 86: // Snow showers: Heavy
      return {
        label: 'Snowy',
        iconName: 'Snowflake',
        themeColor: '#e2e8f0', // Cool White/Slate
        textColor: 'text-slate-200',
        glowColor: 'rgba(226, 232, 240, 0.15)',
        bgGradient: 'from-slate-200/5 via-transparent to-transparent',
      };
    case 95: // Thunderstorm: Slight or moderate
    case 96: // Thunderstorm with slight hail
    case 99: // Thunderstorm with heavy hail
      return {
        label: 'Thunderstorm',
        iconName: 'CloudLightning',
        themeColor: '#a855f7', // Purple/Violet
        textColor: 'text-purple-400',
        glowColor: 'rgba(168, 85, 247, 0.3)',
        bgGradient: 'from-purple-500/15 via-transparent to-transparent',
      };
    default:
      return {
        label: 'Unknown Weather',
        iconName: 'HelpCircle',
        themeColor: '#94a3b8',
        textColor: 'text-slate-400',
        glowColor: 'rgba(148, 163, 184, 0.05)',
        bgGradient: 'from-slate-500/5 via-transparent to-transparent',
      };
  }
}

export function generateRecommendations(
  current: CurrentWeatherData,
  daily: DailyForecastDay[]
): PlanningRecommendation[] {
  const recommendations: PlanningRecommendation[] = [];

  // 1. OUTDOOR WORKOUTS / ATHLETICS
  let fitnessScore = 100;
  const isStormy = [95, 96, 99].includes(current.weatherCode);
  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(current.weatherCode);
  const isSnowy = [71, 73, 75, 77, 85, 86].includes(current.weatherCode);

  if (isStormy) fitnessScore = 10;
  else if (isRainy) fitnessScore = 40;
  else if (isSnowy) fitnessScore = 30;
  else {
    // Temperature adjustment (ideal temperature is 12C to 20C)
    const t = current.temperature2m;
    if (t < 0) fitnessScore -= 50;
    else if (t >= 0 && t < 10) fitnessScore -= 20;
    else if (t > 25 && t <= 32) fitnessScore -= 15;
    else if (t > 32) fitnessScore -= 40;

    // Wind adjustment (ideal wind is < 15km/h)
    const w = current.windSpeed10m;
    if (w > 25) fitnessScore -= 20;
    else if (w > 40) fitnessScore -= 45;
  }

  fitnessScore = Math.max(0, Math.min(100, fitnessScore));
  let fitnessRating: PlanningRecommendation['rating'] = 'Good';
  let fitnessColor = 'text-green-400 border-green-500/20 bg-green-500/5';
  if (fitnessScore >= 85) {
    fitnessRating = 'Excellent';
  } else if (fitnessScore >= 60) {
    fitnessRating = 'Good';
    fitnessColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
  } else if (fitnessScore >= 35) {
    fitnessRating = 'Fair';
    fitnessColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
  } else if (fitnessScore >= 15) {
    fitnessRating = 'Poor';
    fitnessColor = 'text-orange-400 border-orange-500/20 bg-orange-500/5';
  } else {
    fitnessRating = 'Not Recommended';
    fitnessColor = 'text-red-400 border-red-500/20 bg-red-500/5';
  }

  let fitnessDetails = '';
  const fitnessItems: string[] = [];
  if (isStormy) {
    fitnessDetails = 'Severe lightning hazard. Postpone all outdoor cardiovascular activities and seek shelter immediately.';
    fitnessItems.push('Indoor Gym Access', 'Treadmill', 'Hydration');
  } else if (isRainy) {
    fitnessDetails = 'Slippery surfaces and wet conditions. If running or cycling, wear high-traction footwear and water-resistant layers.';
    fitnessItems.push('Waterproof Shell', 'High-grip Shoes', 'Towel');
  } else if (current.temperature2m > 30) {
    fitnessDetails = 'High heat hazard. Reduce training intensity, shift training to early morning, and hydrate heavily with electrolytes.';
    fitnessItems.push('Electrolyte Drink', 'Sunscreen SPF 50', 'Visor/Cap');
  } else if (current.temperature2m < 5) {
    fitnessDetails = 'Freezing air. Dress in warm thermal layers to shield joints and protect lungs from cold-induced airway constriction.';
    fitnessItems.push('Thermal Base Layer', 'Gloves/Headband', 'Warm Drink');
  } else {
    fitnessDetails = 'Incredible conditions for outdoor training! Highly supportive thermal index and low aerodynamic drag.';
    fitnessItems.push('Standard Running Gear', 'Fitness Tracker', 'Hydration Bottle');
  }

  recommendations.push({
    category: 'Outdoor Fitness',
    title: 'Running & Cycling Suitability',
    rating: fitnessRating,
    score: fitnessScore,
    color: fitnessColor,
    details: fitnessDetails,
    itemsToBring: fitnessItems,
  });

  // 2. WARDROBE ADVISOR
  let styleScore = 100;
  let styleRating: PlanningRecommendation['rating'] = 'Excellent';
  const t = current.temperature2m;
  const feelsLike = current.apparentTemperature;
  const styleItems: string[] = [];
  let styleDetails = '';

  if (isRainy) {
    styleItems.push('Compact Umbrella', 'Waterproof Shell / Raincoat', 'Water-resistant Boots');
    styleDetails = 'Wet conditions require an water-repelling outer layer. Prioritize high-top, sealed footwear.';
    styleScore = 70;
    styleRating = 'Good';
  } else if (isStormy) {
    styleItems.push('Heavy-duty Umbrella', 'Waterproof Jacket', 'Heavy Boots');
    styleDetails = 'Active thunderstorms combined with high wind. Sturdy protective outerwear is highly recommended.';
    styleScore = 40;
    styleRating = 'Fair';
  } else if (isSnowy) {
    styleItems.push('Insulated Parka', 'Woolen Beanie & Scarf', 'Thick Thermal Gloves', 'Trapper Boots');
    styleDetails = 'Freezing conditions require a triple-layer thermal insulation: base heat retainer, down fleece mid, and windproof outer shell.';
    styleScore = 60;
    styleRating = 'Good';
  } else if (t < 10) {
    styleItems.push('Heavy Winter Coat', 'Warm Scarf', 'Light Gloves');
    styleDetails = 'Brisk climate. Layering is highly recommended to trap warmth close to body core.';
    styleRating = 'Good';
  } else if (t >= 10 && t < 18) {
    styleItems.push('Sweater or Cardigan', 'Denim Jacket or Trench Coat', 'Closed-toe Shoes');
    styleDetails = 'Mildly cool. A versatile light jacket or elegant knit pullover will keep you comfortable.';
    styleRating = 'Excellent';
  } else if (t >= 18 && t < 26) {
    styleItems.push('Breathable Cotton T-Shirt', 'Linen Trousers or Shorts', 'Sunglasses');
    styleDetails = 'Perfect temperate climate. Light textiles (cotton/linen) provide optimal heat dissipation.';
    styleRating = 'Excellent';
  } else {
    styleItems.push('Ultralight Singlet', 'Shorts', 'Polarized Sunglasses', 'UV Protective Hat');
    styleDetails = 'Scorching thermal conditions. Protect yourself with breathable light-colored fabrics and maximize sun shielding.';
    styleScore = 75;
    styleRating = 'Good';
  }

  // UV additions for clothing
  const maxUV = daily[0]?.uvIndexMax || 0;
  if (maxUV >= 6) {
    styleItems.push('Broad Spectrum Sunscreen (SPF 30+)', 'Polarized UV Sunglasses');
    if (styleDetails.indexOf('UV') === -1) {
      styleDetails += ' Elevated UV index indicates rapid dermal damage. Apply high SPF sunscreen before exposure.';
    }
  }

  let styleColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
  if (styleScore < 50) styleColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';

  recommendations.push({
    category: 'Wardrobe & Style',
    title: 'Smart Clothing Optimizer',
    rating: styleRating,
    score: styleScore,
    color: styleColor,
    details: styleDetails,
    itemsToBring: styleItems,
  });

  // 3. TRAVEL & COMMUTE
  let travelScore = 100;
  let travelDetails = 'Optimal driving traction and clear visibility. Expect normal transit intervals.';
  const travelItems = ['Dash Camera', 'Sunglasses'];

  if (isStormy) {
    travelScore = 20;
    travelDetails = 'Severe hazard. Extremely low visibility, danger of flash flooding, and high risk of hydroplaning. Delay driving if possible.';
    travelItems.push('Hazard Lights On', 'Emergency Contacts List', 'Roadside Kit');
  } else if (current.weatherCode >= 45 && current.weatherCode <= 48) {
    travelScore = 45;
    travelDetails = 'Heavy visual obstruction. Turn on low-beam fog lights, extend safety distance to 4+ car lengths, and expect traffic delays.';
    travelItems.push('Low-beam Fog Lights', 'Defroster Active');
  } else if (isRainy) {
    travelScore = 65;
    travelDetails = 'Reduced traction and damp tarmac. Braking distance increases by 50%. Drive defensively and watch for pooling water.';
    travelItems.push('Active Windshield Wipers', 'Tire Traction Assist');
  } else if (isSnowy) {
    travelScore = 35;
    travelDetails = 'Slippery and packed snow. High risk of sliding. Snow chains or winter tires are strongly advised.';
    travelItems.push('Snow Brush/Scraper', 'Winter Tires/Chains', 'Windshield De-icer');
  }

  let travelRating: PlanningRecommendation['rating'] = 'Excellent';
  let travelColor = 'text-green-400 border-green-500/20 bg-green-500/5';
  if (travelScore >= 85) {
    travelRating = 'Excellent';
  } else if (travelScore >= 60) {
    travelRating = 'Good';
    travelColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
  } else if (travelScore >= 35) {
    travelRating = 'Fair';
    travelColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
  } else {
    travelRating = 'Poor';
    travelColor = 'text-red-400 border-red-500/20 bg-red-500/5';
  }

  recommendations.push({
    category: 'Travel & Commute',
    title: 'Transit Safety Score',
    rating: travelRating,
    score: travelScore,
    color: travelColor,
    details: travelDetails,
    itemsToBring: travelItems,
  });

  // 4. HOME, ENERGY, & GARDENING
  let homeScore = 100;
  let homeRating: PlanningRecommendation['rating'] = 'Excellent';
  let homeColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
  let homeDetails = 'Excellent weather to ventilate the house. No artificial cooling or heating necessary.';
  const homeItems: string[] = [];

  if (current.temperature2m > 30) {
    homeScore = 65;
    homeDetails = 'Severe exterior heat. Seal windows, draw reflective thermal blinds, and program AC/ventilation to pre-cool during lower-rate hours.';
    homeItems.push('Thermostat set to 24°C', 'Reflective Blinds Down', 'Air Purifier Active');
    homeRating = 'Fair';
    homeColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
  } else if (current.temperature2m < 8) {
    homeScore = 70;
    homeDetails = 'High heating load. Ensure seals around doors/windows are airtight. Set smart thermostat to heat conserve mode.';
    homeItems.push('Draft Excluders', 'Smart Thermostat set to 19°C', 'Humidifier');
    homeRating = 'Good';
  } else if (isRainy) {
    homeScore = 80;
    homeDetails = 'Natural crop irrigation active. Cancel automatic garden sprinklers. Ensure gutters are free of leaf blockages.';
    homeItems.push('Disable Sprinklers', 'Dehumidifier Active');
    homeRating = 'Good';
  } else {
    homeItems.push('Open Air Intake Windows', 'Robotic Vacuum Active');
  }

  recommendations.push({
    category: 'Home & Gardening',
    title: 'Energy & Irrigation Advisory',
    rating: homeRating,
    score: homeScore,
    color: homeColor,
    details: homeDetails,
    itemsToBring: homeItems,
  });

  return recommendations;
}
