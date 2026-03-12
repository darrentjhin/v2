import OpenAI from 'openai';
import fs from 'fs';
import { logger } from '../lib/logger';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudio(filePath: string): Promise<string> {
  const start = Date.now();
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1',
  });
  logger.info({ latencyMs: Date.now() - start }, 'transcribeAudio');
  return transcription.text;
}

interface ReplyOptions {
  userText: string;
  screenshotBase64?: string;
  tutorLanguage?: string;
  bilingualMode?: boolean;
  sessionContext?: string;
}

export async function generateTutorReply(opts: ReplyOptions): Promise<string> {
  const start = Date.now();
  const systemPrompt = `You are Leren, a patient, encouraging AI tutor. Respond in ${opts.tutorLanguage ?? 'English'}.
${opts.bilingualMode ? 'Also provide a short translation or explanation in the student\'s native language.' : ''}
Keep answers clear, structured, and educational.`;

  const userContent: OpenAI.ChatCompletionContentPart[] = [
    { type: 'text', text: opts.userText },
  ];

  if (opts.screenshotBase64) {
    userContent.push({
      type: 'image_url',
      image_url: { url: `data:image/png;base64,${opts.screenshotBase64}`, detail: 'low' },
    });
  }

  const messages: OpenAI.ChatCompletionMessageParam[] = [];
  if (opts.sessionContext) {
    messages.push({ role: 'system', content: `${systemPrompt}\n\nConversation so far:\n${opts.sessionContext}` });
  } else {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: userContent });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    max_tokens: 800,
  });

  const reply = completion.choices[0]?.message?.content ?? '';
  logger.info({ latencyMs: Date.now() - start, tokens: completion.usage?.total_tokens }, 'generateTutorReply');
  return reply;
}

export async function generatePracticeProblems(subject: string, difficulty: string, count: number): Promise<Array<{ prompt: string; solution: string }>> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a curriculum expert. Return ONLY valid JSON — an array of objects with "prompt" and "solution" fields.',
      },
      {
        role: 'user',
        content: `Generate ${count} ${difficulty} practice problems for: ${subject}. Return as JSON array: [{"prompt":"...","solution":"..."}]`,
      },
    ],
    response_format: { type: 'json_object' },
  });
  const raw = completion.choices[0]?.message?.content ?? '{"problems":[]}';
  const parsed = JSON.parse(raw) as { problems?: Array<{ prompt: string; solution: string }> };
  return (parsed.problems ?? []).slice(0, count);
}

export async function checkAnswer(prompt: string, solution: string, answer: string): Promise<{ isCorrect: boolean; feedback: string }> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a grader. Return ONLY JSON: {"isCorrect": boolean, "feedback": "string"}' },
      { role: 'user', content: `Problem: ${prompt}\nExpected solution: ${solution}\nStudent answer: ${answer}\nIs the student correct?` },
    ],
    response_format: { type: 'json_object' },
  });
  return JSON.parse(completion.choices[0]?.message?.content ?? '{"isCorrect":false,"feedback":"Could not grade."}');
}

export async function generateSubjectSummary(
  subjectName: string,
  fileContexts: Array<{ type: 'text' | 'image' | 'pdf'; content: string }>,
): Promise<string> {
  const userContent: OpenAI.ChatCompletionContentPart[] = [];

  const textParts = fileContexts.filter(f => f.type === 'text').map(f => f.content).join('\n\n');
  if (textParts) userContent.push({ type: 'text', text: `Study material:\n${textParts}` });
  for (const f of fileContexts.filter(f => f.type === 'image' || f.type === 'pdf')) {
    userContent.push({ type: 'image_url', image_url: { url: `data:image/png;base64,${f.content}`, detail: 'high' } });
  }
  userContent.push({
    type: 'text',
    text: `Summarise all the key concepts, topics, and important points from the above study materials for the subject "${subjectName}". Write in clear sections with headers. Be thorough but concise.`,
  });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an expert academic summariser. Produce a well-structured study summary.' },
      { role: 'user', content: userContent },
    ],
    max_tokens: 1500,
  });
  return completion.choices[0]?.message?.content ?? '';
}

export async function generatePracticeFromSubject(
  subjectName: string,
  fileContexts: Array<{ type: 'text' | 'image' | 'pdf'; content: string }>,
  difficulty: string,
  count: number,
): Promise<Array<{ prompt: string; solution: string }>> {
  const userContent: OpenAI.ChatCompletionContentPart[] = [];

  if (fileContexts.length > 0) {
    const textParts = fileContexts.filter(f => f.type === 'text').map(f => f.content).join('\n\n');
    if (textParts) userContent.push({ type: 'text', text: `Study material:\n${textParts}` });

    for (const f of fileContexts.filter(f => f.type === 'image' || f.type === 'pdf')) {
      userContent.push({
        type: 'image_url',
        image_url: { url: `data:image/png;base64,${f.content}`, detail: 'low' },
      });
    }
  }

  userContent.push({
    type: 'text',
    text: `Generate ${count} ${difficulty} practice exam questions for the subject: "${subjectName}". Base questions on the provided study material if available. Return ONLY a JSON object: {"problems":[{"prompt":"...","solution":"..."}]}`,
  });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a curriculum expert. Return ONLY valid JSON with a "problems" array.' },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content ?? '{"problems":[]}';
  const parsed = JSON.parse(raw) as { problems?: Array<{ prompt: string; solution: string }> };
  return (parsed.problems ?? []).slice(0, count);
}

export async function extractTextFromFile(fileBase64: string, mimeType: string, fileName: string): Promise<string> {
  if (mimeType === 'text/plain') {
    return Buffer.from(fileBase64, 'base64').toString('utf-8');
  }
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Extract all readable text and content from this file. Return the raw text only.' },
      {
        role: 'user',
        content: [
          { type: 'text', text: `Extract all text from this file: ${fileName}` },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${fileBase64}`, detail: 'high' } },
        ],
      },
    ],
  });
  return completion.choices[0]?.message?.content ?? '';
}

export async function analyzeAssignment(fileBase64: string, mimeType: string): Promise<{ summary: string; questions: string[] }> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Extract the academic assignment content. Return JSON: {"summary":"...","questions":["..."]}' },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this assignment and extract the summary and list of questions.' },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${fileBase64}`, detail: 'low' } },
        ],
      },
    ],
    response_format: { type: 'json_object' },
  });
  return JSON.parse(completion.choices[0]?.message?.content ?? '{"summary":"","questions":[]}');
}
