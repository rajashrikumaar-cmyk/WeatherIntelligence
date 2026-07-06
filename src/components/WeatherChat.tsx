import React, { useState, useRef, useEffect } from 'react';
import { WeatherData } from '../types';
import { getWeatherCondition } from '../utils/weatherUtils';
import * as Icons from 'lucide-react';

interface WeatherChatProps {
  weather: WeatherData;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function WeatherChat({ weather }: WeatherChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I'm **Aether**, your personal Weather Intelligence Assistant. I have analyzed the conditions in **${weather.city}**.

How can I help you adjust your schedule or style today? Ask me about wardrobe planning, workout scheduling, commuting, or home energy optimization!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const condition = getWeatherCondition(weather.current.weatherCode);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          weatherContext: {
            city: weather.city,
            temp: weather.current.temperature2m,
            condition: condition.label,
            humidity: weather.current.relativeHumidity2m,
            wind: weather.current.windSpeed10m,
            uv: weather.daily[0]?.uvIndexMax || 0,
          },
        }),
      });

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'ai',
        text: data.text || 'I encountered an issue processing that. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'ai',
        text: 'I lost connection to Aether servers. Please verify that the application backend is responsive and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseMessageText = (text: string) => {
    // Simple custom Markdown parser for bold (**bold**), bullet points, and headers
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;

      // Handle Bold text
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="font-bold text-white">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const renderedText = parts.length > 0 ? parts : content;

      // Check if it's a bullet point
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().substring(2);
        const parsedBulletParts = [];
        let bLastIndex = 0;
        let bMatch;
        boldRegex.lastIndex = 0;

        while ((bMatch = boldRegex.exec(bulletText)) !== null) {
          if (bMatch.index > bLastIndex) {
            parsedBulletParts.push(bulletText.substring(bLastIndex, bMatch.index));
          }
          parsedBulletParts.push(
            <strong key={bMatch.index} className="font-bold text-white">
              {bMatch[1]}
            </strong>
          );
          bLastIndex = boldRegex.lastIndex;
        }

        if (bLastIndex < bulletText.length) {
          parsedBulletParts.push(bulletText.substring(bLastIndex));
        }

        return (
          <li key={idx} className="ml-4 list-disc pl-1 py-0.5 text-zinc-300 text-sm">
            {parsedBulletParts.length > 0 ? parsedBulletParts : bulletText}
          </li>
        );
      }

      // Check if it's numbered list
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        const listText = numMatch[2];
        const parsedListParts = [];
        let lLastIndex = 0;
        let lMatch;
        boldRegex.lastIndex = 0;

        while ((lMatch = boldRegex.exec(listText)) !== null) {
          if (lMatch.index > lLastIndex) {
            parsedListParts.push(listText.substring(lLastIndex, lMatch.index));
          }
          parsedListParts.push(
            <strong key={lMatch.index} className="font-bold text-white">
              {lMatch[1]}
            </strong>
          );
          lLastIndex = boldRegex.lastIndex;
        }

        if (lLastIndex < listText.length) {
          parsedListParts.push(listText.substring(lLastIndex));
        }

        return (
          <div key={idx} className="pl-1 py-1 text-zinc-300 text-sm flex gap-2">
            <span className="font-mono text-zinc-500 shrink-0">{numMatch[1]}.</span>
            <span>{parsedListParts.length > 0 ? parsedListParts : listText}</span>
          </div>
        );
      }

      // Handle section headings
      if (line.trim().startsWith('###')) {
        return (
          <h4 key={idx} className="text-sm font-semibold text-white mt-3 mb-1">
            {renderedText}
          </h4>
        );
      }

      // Empty line
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      // Standard paragraph
      return (
        <p key={idx} className="text-sm text-zinc-300 leading-relaxed font-sans py-0.5">
          {renderedText}
        </p>
      );
    });
  };

  const QUICK_PROMPTS = [
    { text: 'Should I go for a run?', icon: Icons.Activity },
    { text: 'What is the optimal clothing layout?', icon: Icons.Shirt },
    { text: 'Commute safety & highway risk?', icon: Icons.Car },
    { text: 'Home heating/cooling advice?', icon: Icons.Home },
  ];

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-[520px] overflow-hidden border-white/10 relative">
      {/* Chat header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <Icons.Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-white tracking-tight flex items-center gap-1.5">
              Aether Assistant
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">GEMINI INTEL PROCESSOR</span>
          </div>
        </div>
        <Icons.Bot className="w-5 h-5 text-zinc-500" />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'items-start'}`}
          >
            <div
              className={`rounded-2xl px-4 py-3 border ${
                msg.sender === 'user'
                  ? 'bg-white/10 border-white/15 text-white rounded-tr-none'
                  : 'bg-white/[0.03] border-white/5 text-zinc-300 rounded-tl-none'
              }`}
            >
              <div className="space-y-1">{parseMessageText(msg.text)}</div>
            </div>
            <span className="text-[9px] font-mono text-zinc-600 mt-1 px-1">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 pl-1 animate-pulse">
            <Icons.Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
            Aether is analyzing forecasting model...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggestion Quick Prompts */}
      <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-white/5 bg-black/40">
        {QUICK_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.text)}
            disabled={isLoading}
            className="text-[11px] font-medium text-zinc-400 hover:text-white bg-white/[0.02] border border-white/[0.04] hover:border-white/10 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all duration-200 disabled:opacity-50"
          >
            <p.icon className="w-3 h-3 text-zinc-500" />
            {p.text}
          </button>
        ))}
      </div>

      {/* Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 bg-neutral-950/60 border-t border-white/5 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Ask Aether custom weather queries..."
          className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl transition-all duration-200 flex items-center justify-center shrink-0"
        >
          <Icons.Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
