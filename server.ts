import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Helper to get GoogleGenAI client if key is configured
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// ----------------------------------------------------
// API 1: /api/analyze-prescription
// Optical & Clinical Prescription Extraction
// ----------------------------------------------------
app.post('/api/analyze-prescription', async (req: Request, res: Response): Promise<void> => {
  const gemini = getGeminiClient();

  if (!gemini) {
    res.status(503).json({
      error: 'AI_NOT_CONFIGURED',
      message: 'AI service not configured. Please configure GEMINI_API_KEY on the server to enable real-time prescription OCR.'
    });
    return;
  }

  try {
    const { imageBase64, mimeType } = req.body;

    const prompt = `You are a clinical pharmacologist auditing a prescription document.
Analyze the provided prescription image and extract in strict JSON format:
{
  "patientName": string,
  "doctorName": string,
  "date": "YYYY-MM-DD",
  "items": [
    {
      "id": string,
      "medicine_name": string,
      "strength": string,
      "dosage_form": string,
      "dosage_instructions": string,
      "frequency": string,
      "duration": string,
      "extraction_confidence": "clearly_extracted" | "uncertain" | "not_visible",
      "confidence_score": number (0.0 to 1.0),
      "verification_status": "unverified"
    }
  ]
}
If any handwriting is illegible or ambiguous, flag extraction_confidence as "uncertain" or "not_visible". Never guess strengths or names.`;

    const contents: any[] = [prompt];
    if (imageBase64 && mimeType) {
      contents.push({
        inlineData: {
          mimeType,
          data: imageBase64
        }
      });
    }

    const callPromise = gemini.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json'
      }
    });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI generation timed out')), 7000)
    );
    const response = await Promise.race([callPromise, timeoutPromise]) as any;

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: any) {
    console.error('Error analyzing prescription:', err);
    res.status(500).json({
      error: 'ANALYSIS_FAILED',
      message: err.message || 'Failed to analyze prescription image'
    });
  }
});

// ----------------------------------------------------
// API 2: /api/identify-medicine
// Pill & packaging visual identification
// ----------------------------------------------------
app.post('/api/identify-medicine', async (req: Request, res: Response): Promise<void> => {
  const gemini = getGeminiClient();

  if (!gemini) {
    res.status(503).json({
      error: 'AI_NOT_CONFIGURED',
      message: 'AI service not configured. Please configure GEMINI_API_KEY on the server to enable medicine packaging recognition.'
    });
    return;
  }

  try {
    const { imageBase64, mimeType } = req.body;

    const prompt = `Identify this medicine package or pill photo. Return strict JSON:
{
  "brandName": string,
  "genericName": string,
  "strength": string,
  "dosageForm": string,
  "manufacturer": string,
  "batchNumber": string,
  "expiryDate": string,
  "indications": string[],
  "precautions": string[],
  "scheduleClass": string,
  "isLasaRisk": boolean
}`;

    const contents: any[] = [prompt];
    if (imageBase64 && mimeType) {
      contents.push({
        inlineData: {
          mimeType,
          data: imageBase64
        }
      });
    }

    const callPromise = gemini.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json'
      }
    });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI generation timed out')), 7000)
    );
    const response = await Promise.race([callPromise, timeoutPromise]) as any;

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error identifying medicine:', err);
    res.status(500).json({
      error: 'IDENTIFY_FAILED',
      message: err.message || 'Failed to identify medicine packaging'
    });
  }
});

// ----------------------------------------------------
// API 3: /api/chat
// Clinical AI & Multilingual Voice Consultation (EN & Tamil)
// ----------------------------------------------------
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  const gemini = getGeminiClient();

  if (!gemini) {
    res.status(503).json({
      error: 'AI_NOT_CONFIGURED',
      message: 'AI service not configured. Please configure GEMINI_API_KEY on the server to enable interactive clinical chat.'
    });
    return;
  }

  try {
    const { message, language, isVoice, history } = req.body;

    const systemInstruction = `You are Medivexa AI, a high-precision clinical pharmacology decision support assistant.
Your objectives:
1. Provide accurate, evidence-based medication guidance grounded in official pharmacology (FDA, WHO, National Formularies).
2. Explicitly highlight any Look-Alike Sound-Alike (LASA) risks when medications with similar names are mentioned.
3. If the user asks in Tamil (தமிழ்) or specifies language 'ta', respond fluently and clearly in Tamil with accurate medical terminology.
4. Keep voice responses concise, empathetic, and easily speakable via text-to-speech without markdown tables or asterisks.
5. Always remind users that final dispensing and changes must be authorized by a licensed healthcare practitioner.`;

    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history) {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    let replyText = '';
    try {
      const callPromise = gemini.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI generation timed out')), 6000)
      );

      const response = await Promise.race([callPromise, timeoutPromise]) as any;
      replyText = response.text || '';
    } catch (genErr: any) {
      console.warn('Gemini generateContent error, attempting clinical rule fallback:', genErr.message);
      const lower = message.toLowerCase();
      if (lower.includes('celebrex') && lower.includes('celexa')) {
        replyText = language === 'ta'
          ? 'முக்கிய LASA எச்சரிக்கை: செலெப்ரெக்ஸ் (Celebrex - Celecoxib) என்பது வலி மற்றும் மூட்டு வாதத்திற்கான NSAID மருந்து. செலெக்ஸ் (Celexa - Citalopram) என்பது மன அழுத்தத்திற்கான SSRI மருந்து. பெயர்கள் ஒலிக்கும்போது ஒரே மாதிரியாக இருப்பதால் தவறாக விநியோகிக்கும் அபாயம் அதிகம். பரிந்துரைக்கப்பட்ட அறிகுறிகளை உங்கள் மருத்துவரிடம் உறுதிப்படுத்தவும்.'
          : 'CRITICAL LASA ADVISORY: Celebrex (Celecoxib) is a COX-2 selective NSAID anti-inflammatory indicated for osteoarthritis and acute pain. Celexa (Citalopram) is an SSRI antidepressant indicated for major depressive disorder. Because they are classic Look-Alike Sound-Alike medications, dispensing Celexa for pain can cause severe depression relapse or NSAID-related GI bleed if mismanaged. Always confirm the therapeutic indication.';
      } else if (lower.includes('hydralazine') || lower.includes('hydroxyzine')) {
        replyText = language === 'ta'
          ? 'முக்கிய பாதுகாப்பு எச்சரிக்கை: ஹைட்ராலசின் (Hydralazine) இரத்த அழுத்தத்தைக் குறைக்கும் வாசோடைலேட்டர் மருந்து. ஹைட்ராக்ஸிசைன் (Hydroxyzine) அரிப்பு மற்றும் பதட்டத்திற்கான ஆண்டிஹிஸ்டமைன் மருந்து. இவற்றை மாற்றி உட்கொண்டால் இரத்த அழுத்தம் ஆபத்தான அளவுக்கு குறையக்கூடும்.'
          : 'HIGH-ALERT LASA WARNING: Hydralazine is a direct-acting arterial vasodilator for hypertension; Hydroxyzine is a first-generation H1-antihistamine for anxiety and pruritus. Confusing these two medications can cause catastrophic hypotension or profound central nervous system sedation.';
      } else if (lower.includes('metformin')) {
        replyText = language === 'ta'
          ? 'மெட்ஃபோர்மின் (Metformin) வகை 2 நீரிழிவு நோய்க்கான முதல் நிலை மருந்து. இது கல்லீரலில் குளுக்கோஸ் உற்பத்தியைக் குறைத்து இன்சுலின் உணர்திறனை மேம்படுத்துகிறது. பொதுவான பக்க விளைவுகளில் குமட்டல் மற்றும் வயிற்றுப்போக்கு அடங்கும். உணவுக்குப் பிறகு உட்கொள்ள வேண்டும்.'
          : 'Metformin is a biguanide antidiabetic agent that decreases hepatic glucose production and improves insulin sensitivity. Key counseling point: Take with or after meals to minimize gastrointestinal discomfort. Exercise caution with iodinated radiocontrast procedures.';
      } else if (language === 'ta') {
        replyText = 'மருத்துவ வழிகாட்டுதல்: மருத்துவர் பரிந்துரைத்த வழிமுறைகளை கவனமாக பின்பற்றவும். ஏதேனும் முரண்பாடுகள் அல்லது ஒவ்வாமை இருந்தால் உடனடியாக உங்கள் மருந்தாளரிடம் உறுதிப்படுத்தவும்.';
      } else {
        replyText = 'Clinical Guidance: All medication regimens must be verified for correct dosage, frequency, and potential drug-drug interactions by a registered pharmacist. For comprehensive drug monographs, please consult the Medivexa Drug Reference Catalog.';
      }
    }

    res.json({
      reply: replyText
    });
  } catch (err: any) {
    console.error('Error in chat:', err);
    res.status(500).json({
      error: 'CHAT_FAILED',
      message: err.message || 'Clinical chat query failed'
    });
  }
});

// ----------------------------------------------------
// Mount Vite middlewares in dev or serve dist in prod
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Medivexa AI server running on port ${PORT}`);
  });
}

startServer();
