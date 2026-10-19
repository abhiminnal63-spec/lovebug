import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Generate romantic sticker / polaroid image using gemini-nano-banana-2.1
 */
app.post('/api/gemini/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1', style = 'kawaii' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const enhancedPrompt = `Cute romantic ${style} illustration sticker: ${prompt}. Soft pastel colors, warm blush tones, delicate charming details, high quality storybook art, clean background, no harsh text.`;

    let base64Image: string | null | undefined = null;
    let mimeType = 'image/png';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as '1:1' | '3:4' | '4:3' | '16:9' | '9:16',
            imageSize: '1K',
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }
    } catch (primaryErr) {
      console.warn('Primary model error, falling back to gemini-3.1-flash-lite-image:', primaryErr);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as '1:1' | '3:4' | '4:3' | '16:9' | '9:16',
          },
        },
      });

      const parts = fallbackResponse.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }
    }

    if (!base64Image) {
      return res.status(500).json({ error: 'No image data returned from model' });
    }

    return res.json({
      imageUrl: `data:${mimeType};base64,${base64Image}`,
      prompt,
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate image' });
  }
});

/**
 * Edit existing polaroid image using Gemini
 */
app.post('/api/gemini/edit-image', async (req: Request, res: Response) => {
  try {
    const { base64Image, prompt } = req.body;
    if (!base64Image || !prompt) {
      return res.status(400).json({ error: 'Base64 image and edit prompt are required' });
    }

    const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png',
            },
          },
          {
            text: `Keep the cute romantic pastel sticker style. Edit instruction: ${prompt}`,
          },
        ],
      },
    });

    let resultImage: string | null | undefined = null;
    let mimeType = 'image/png';

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        resultImage = part.inlineData.data;
        mimeType = part.inlineData.mimeType || 'image/png';
        break;
      }
    }

    if (!resultImage) {
      return res.status(500).json({ error: 'Model did not return edited image' });
    }

    return res.json({
      imageUrl: `data:${mimeType};base64,${resultImage}`,
      prompt,
    });
  } catch (error: any) {
    console.error('Error editing image:', error);
    return res.status(500).json({ error: error?.message || 'Failed to edit image' });
  }
});

/**
 * Generate personalized sweet love letter / date poem
 */
app.post('/api/gemini/romantic-poem', async (req: Request, res: Response) => {
  try {
    const { date, time, food, preferences, note } = req.body;

    const prompt = `Write a charming, wholesome, ultra-romantic short love note and a 4-line rhyming poem for a cute date invitation.
Date details:
- Day: ${date || 'Soon'}
- Time: ${time || 'Dinner time'}
- Craving: ${food || 'Good food together'}
- Vibe preferences: ${preferences ? preferences.join(', ') : 'Cozy & sweet'}
- Special note: ${note || 'None'}

Formatting:
Return a JSON object with:
"note": "A heartwarming 2-sentence note in an affectionate, excited, cute voice",
"poem": "A 4-line romantic rhyming stanza",
"mascotQuote": "A short cute one-liner from the couple"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating poem:', error);
    // Graceful fallback if API key or network is not available
    return res.json({
      note: "Every moment with you turns into my favorite memory. I already have butterflies counting down the hours until our date!",
      poem: "A table for two and your sweetest smile,\nWe'll laugh and we'll chat for a long lovely while.\nWith good food to share and my hand held in yours,\nYou're the sweetest adventure my heart could adore.",
      mascotQuote: "I already picked out my cutest outfit for our date! ✨💕"
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LOVEBUG server running at http://localhost:${PORT}`);
  });
}

startServer();
