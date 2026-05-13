import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. AI features may not work.');
}

export const genAI = new GoogleGenAI({ apiKey: apiKey || '' });

export async function askGemini(prompt: string, context: string = '') {
  try {
    const model = genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context ? `Context:\n${context}\n\nStudent request:\n${prompt}` : prompt,
      config: {
        systemInstruction: `You are LexAI, a specialised academic assistant for a Stellenbosch University BAccLLB student.

Core behaviour:
- Be honest. Do not invent statutes, cases, sources, marks, module rules or facts.
- If official module material is needed, say so and explain exactly what to check.
- Keep answers exam-focused, practical and structured.
- When useful, give a simple explanation first, then a formal academic version.
- For accounting, emphasise classification, journal logic, presentation, disclosure, clean workings and examiner traps.
- For law, emphasise issue spotting, authority hierarchy, ratio, application, footnote awareness and direct conclusions.
- For planning, produce concrete timed tasks, weak-point priorities, checklists and active recall loops.
- Avoid generic study advice when the student needs an executable plan.`,
      },
    });
    const result = await model;
    return result.text || 'I generated a response, but no text was returned.';
  } catch (error) {
    console.error('Gemini Error:', error);
    return "I'm sorry, I encountered an error while processing your request. Check the Gemini API key and model availability, then try again.";
  }
}
