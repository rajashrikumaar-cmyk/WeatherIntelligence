import { PlanningRecommendation } from '../types';
import * as Icons from 'lucide-react';

interface PlanningRecommendationsProps {
  recommendations: PlanningRecommendation[];
}

export default function PlanningRecommendations({ recommendations }: PlanningRecommendationsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            <Icons.Compass className="w-5 h-5 text-white animate-spin-slow" />
            Intelligent Planning Advisors
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            Real-time, context-aware advice for your daily schedule and activities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.map((rec) => {
          // Get dynamic icon based on category
          let IconComponent = Icons.HelpCircle;
          if (rec.category.includes('Fitness')) IconComponent = Icons.Activity;
          else if (rec.category.includes('Wardrobe') || rec.category.includes('Clothing')) IconComponent = Icons.Shirt;
          else if (rec.category.includes('Travel') || rec.category.includes('Transit')) IconComponent = Icons.Car;
          else if (rec.category.includes('Home') || rec.category.includes('Energy')) IconComponent = Icons.Home;

          return (
            <div
              key={rec.category}
              id={`rec-card-${rec.category.toLowerCase().replace(/\s+/g, '-')}`}
              className="glass-panel glass-panel-hover rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden"
            >
              {/* Corner ambient rating background glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-bl-full pointer-events-none" />

              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-mono tracking-wider uppercase text-zinc-500">
                        {rec.category}
                      </span>
                      <h3 className="text-base font-display font-semibold text-white leading-tight">
                        {rec.title}
                      </h3>
                    </div>
                  </div>

                  <div className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${rec.color}`}>
                    {rec.rating}
                  </div>
                </div>

                {/* Score Indicator & Text */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-400">Activity Compatibility</span>
                    <span className="text-white font-semibold">{rec.score}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/[0.03]">
                    <div
                      className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-1000 ease-out"
                      style={{ width: `${rec.score}%` }}
                    />
                  </div>
                </div>

                {/* Descriptive advice */}
                <p className="mt-4 text-sm text-zinc-300 leading-relaxed font-sans">
                  {rec.details}
                </p>
              </div>

              {/* Items to bring check-list */}
              {rec.itemsToBring.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/5">
                  <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Icons.CheckCircle className="w-3.5 h-3.5 text-zinc-400" />
                    Recommended Essentials
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.itemsToBring.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium text-white bg-white/5 border border-white/8 px-2.5 py-1 rounded-lg flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 bg-white rounded-full opacity-60" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
