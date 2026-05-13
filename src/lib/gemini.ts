export interface StudyAIPayload {
  prompt: string;
  context?: string;
  moduleId?: string;
  moduleName?: string;
  promptMode?: string;
  promptPackId?: string;
  weakPoints?: string[];
  options?: Record<string, unknown>;
}

export async function askGemini(payload: StudyAIPayload): Promise<string> {
  const response = await fetch('/api/study-ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : 'StudyAI request failed.');
  }

  if (typeof data?.text !== 'string' || !data.text.trim()) {
    throw new Error('StudyAI returned an empty response.');
  }

  return data.text;
}
