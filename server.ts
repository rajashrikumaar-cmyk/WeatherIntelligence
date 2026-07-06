import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Weather Chatbot Endpoint using server-side Gemini API
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, weatherContext } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      // Graceful fallback warning if key is placeholder or missing
      return res.json({
        text: `[SYSTEM: Gemini API Key not set up in Settings secrets]

Based on the weather in **${weatherContext.city || 'your city'}** (${weatherContext.temp || 'N/A'}°C, ${weatherContext.condition || 'Clear'}):

${getOfflineAdvice(prompt, weatherContext)}`,
        offline: true
      });
    }

    // Lazy initialization of GoogleGenAI
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are "Aether", an advanced Weather Intelligence AI bot integrated into the Weather Intelligence App.
Your objective is to help the user plan their day, clothing, travel, fitness routines, and overall lifestyle based on real-time weather parameters.
Keep answers structured, elegant, high-contrast, and action-oriented. Use clear markdown bullets and bold text.
Always refer to the current weather context provided:
- City: ${weatherContext.city}
- Temp: ${weatherContext.temp}°C
- Condition: ${weatherContext.condition}
- Humidity: ${weatherContext.humidity}%
- Wind: ${weatherContext.wind} km/h
- Max UV index: ${weatherContext.uv}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Helper for offline smart advice matching
function getOfflineAdvice(prompt: string, context: any): string {
  const p = prompt.toLowerCase();
  const c = context.condition.toLowerCase();
  const temp = parseFloat(context.temp);

  if (p.includes('run') || p.includes('workout') || p.includes('fitness') || p.includes('exercise')) {
    if (c.includes('rain') || c.includes('drizzle') || c.includes('storm')) {
      return `🌧️ Outdoor workouts are currently not recommended due to precipitation. 
      
**Aether's suggestions:**
1. **Core Strength Circuit:** Complete a 35-minute indoor HIIT or core workout.
2. **Stationary Cardio:** Utilize a home trainer, treadmill, or jump rope.
3. **Yoga / Flexibility:** Excellent time for muscle recovery and mindfulness stretch.`;
    }
    if (temp > 30) {
      return `🔥 Active heat alert (${temp}°C). Outdoor running should be restricted.
      
**Aether's suggestions:**
1. **Schedule Shift:** Run only before 7:00 AM or after 7:30 PM.
2. **Heart Rate Cap:** Lower your training target threshold by 10-15 bpm.
3. **Indoor gym:** Use air-conditioned indoor environments.`;
    }
    return `🏃 Gorgeous conditions for training!
    
**Aether's suggestions:**
1. **Tempo Run:** Perfect temperate weather for interval or threshold training.
2. **Hydration:** Keep fluid intake standard (500ml per hour).
3. **Route:** Choose an scenic outdoor path!`;
  }

  if (p.includes('wear') || p.includes('clothe') || p.includes('outfit') || p.includes('jacket') || p.includes('style')) {
    if (temp < 10) {
      return `🧥 Heavy protection required!
      
**Aether's suggestions:**
- **Inner:** Thermal base layer (wool/synthetic) to trap body heat.
- **Mid:** Down fleece vest or chunky knit crewneck.
- **Outer:** Insulated windbreaker or heavy wool overcoat.
- **Accessories:** Woolen beanie and gloves.`;
    }
    if (temp >= 10 && temp < 20) {
      return `🧥 Mild layering conditions.
      
**Aether's suggestions:**
- **Upper:** Long-sleeve Henley, denim button-up, or light knit sweater.
- **Outer:** Lightweight trench, leather jacket, or chore coat.
- **Bottom:** Durable raw denim or tailored chinos.`;
    }
    return `👕 Breezy and warm.
    
**Aether's suggestions:**
- **Material:** Pure linens, cottons, or moisture-wicking synthetics.
- **Upper:** Breathable short-sleeve button-up or relaxed linen tee.
- **Bottom:** Breathable shorts or lightweight linen trousers.`;
  }

  return `✨ I am here to help you coordinate your schedule with the weather! 

**Here is what you can ask me:**
- "Should I go for a run right now?"
- "What clothing layout is optimal?"
- "How does today look for highway travel?"
- "What plants in my garden need extra water?"`;
}

// Serve Frontend using Vite Middleware in Development, or Static build in Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Weather Intelligence server started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
