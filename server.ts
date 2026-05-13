import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const STUDY_AI_SYSTEM_INSTRUCTION = `You are LexAI, a specialised academic assistant for a Stellenbosch University BAccLLB student.

Core behaviour:
- Be honest. Do not invent statutes, cases, sources, marks, module rules or facts.
- If official module material is needed, say so and explain exactly what to check.
- Keep answers exam-focused, practical and structured.
- When useful, give a simple explanation first, then a formal academic version.
- For accounting, emphasise classification, journal logic, presentation, disclosure, clean workings and examiner traps.
- For law, emphasise issue spotting, authority hierarchy, ratio, application, footnote awareness and direct conclusions.
- For planning, produce concrete timed tasks, weak-point priorities, checklists and active recall loops.
- Avoid generic study advice when the student needs an executable plan.`;

interface StudyAIRequestBody {
  prompt?: string;
  context?: string;
  moduleId?: string;
  moduleName?: string;
  promptMode?: string;
  promptPackId?: string;
  weakPoints?: string[];
  options?: Record<string, unknown>;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/study-ai", async (req, res) => {
    const body = (req.body ?? {}) as StudyAIRequestBody;
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const context = typeof body.context === 'string' ? body.context.trim() : '';
    const weakPoints = Array.isArray(body.weakPoints)
      ? body.weakPoints.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [];

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const genAI = new GoogleGenAI({ apiKey });
    const metaContext = [
      body.moduleId ? `Module ID: ${body.moduleId}` : null,
      body.moduleName ? `Module Name: ${body.moduleName}` : null,
      body.promptMode ? `Prompt Mode: ${body.promptMode}` : null,
      body.promptPackId ? `Prompt Pack: ${body.promptPackId}` : null,
      weakPoints.length > 0 ? `Weak Points: ${weakPoints.join('; ')}` : null,
      body.options ? `Options: ${JSON.stringify(body.options)}` : null,
    ].filter(Boolean).join('\n');

    const contents = [context, metaContext, `Student request:\n${prompt}`]
      .filter((part) => part && part.trim().length > 0)
      .join('\n\n');

    try {
      const result = await genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          systemInstruction: STUDY_AI_SYSTEM_INSTRUCTION,
        },
      });

      const text = result.text?.trim();
      if (!text) {
        return res.status(502).json({ error: 'Gemini returned an empty response.' });
      }

      return res.json({ text });
    } catch (error) {
      console.error('StudyAI route error:', error instanceof Error ? error.message : String(error));
      return res.status(502).json({ error: 'StudyAI generation failed. Check server-side Gemini configuration and try again.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
