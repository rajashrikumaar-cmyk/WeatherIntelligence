import { useEffect, useState } from 'react';

interface WeatherBackgroundProps {
  weatherCode: number;
}

export default function WeatherBackground({ weatherCode }: WeatherBackgroundProps) {
  const [drops, setDrops] = useState<{ id: number; left: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate rain drops if rain codes
    const isRain = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode);
    const isStorm = [95, 96, 99].includes(weatherCode);

    if (isRain || isStorm) {
      const dropCount = isStorm ? 50 : 30;
      const newDrops = Array.from({ length: dropCount }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${0.8 + Math.random() * 0.8}s`,
      }));
      setDrops(newDrops);
    } else {
      setDrops([]);
    }
  }, [weatherCode]);

  // Determine weather category
  const isSun = weatherCode === 0;
  const isRain = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode);
  const isStorm = [95, 96, 99].includes(weatherCode);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl z-0">
      {/* Base overlay gradient to darken the canvas */}
      <div className="absolute inset-0 bg-neutral-950/70 z-1" />

      {/* SUN BACKGROUND: Radiant Glowing Amber Orbit */}
      {isSun && (
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[80px] bg-amber-500/20 animate-pulse z-0" />
      )}

      {/* RAIN BACKGROUND: Cool Cyan/Sky glow & falling drops */}
      {isRain && (
        <>
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[90px] bg-cyan-500/15 z-0" />
          <div className="absolute inset-0 z-2 overflow-hidden">
            {drops.map((drop) => (
              <div
                key={drop.id}
                className="rain-drop"
                style={{
                  left: drop.left,
                  animationDelay: drop.delay,
                  animationDuration: drop.duration,
                  height: '16px',
                  width: '1px',
                  background: 'linear-gradient(transparent, #22d3ee)',
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* STORM BACKGROUND: Violent Purple glow & random strobe flashes */}
      {isStorm && (
        <>
          {/* Deep energetic purple backing glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] bg-purple-600/20 z-0" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-[100px] bg-fuchsia-600/10 z-0" />

          {/* Storm lightning flashing simulation */}
          <div
            className="absolute inset-0 bg-white/5 opacity-0 z-1"
            style={{
              animation: 'flash 8s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite',
            }}
          />

          <div className="absolute inset-0 z-2 overflow-hidden">
            {drops.map((drop) => (
              <div
                key={drop.id}
                className="rain-drop"
                style={{
                  left: drop.left,
                  animationDelay: drop.delay,
                  animationDuration: drop.duration,
                  height: '24px',
                  width: '1.5px',
                  background: 'linear-gradient(transparent, #a855f7)',
                }}
              />
            ))}
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes flash {
              0%, 94%, 98%, 100% { opacity: 0; }
              95% { opacity: 0.8; }
              96% { opacity: 0.2; }
              97% { opacity: 0.9; }
            }
          `}} />
        </>
      )}

      {/* CLOUDY/FOG/DEFAULT BACKGROUND: Subtle cold zinc/slate glow */}
      {!isSun && !isRain && !isStorm && (
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[90px] bg-zinc-600/10 z-0" />
      )}
    </div>
  );
}
