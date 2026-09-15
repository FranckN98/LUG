import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { locales, type Locale } from '@/i18n/config';
import { findBestMatches, getContactFallback } from '@/lib/botAnswer';
import type { BotKnowledgeEntry } from '@/content/botKnowledge';

const MAX_MESSAGE_LENGTH = 500;
const MIN_MATCH_SCORE = 2;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit({ key: 'bot-chat', id: ip, windowMs: 60_000, max: 15, blockMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests, please slow down.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let body: { message?: unknown; locale?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const localeInput = typeof body.locale === 'string' ? body.locale : 'en';
  const locale: Locale = (locales as readonly string[]).includes(localeInput)
    ? (localeInput as Locale)
    : 'en';

  if (!message) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: 'Message too long.' }, { status: 400 });
  }

  const matches = findBestMatches(message, locale, 3);
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const reply = await getAiReply(
        message,
        locale,
        matches.map((m) => m.entry),
        apiKey,
      );
      return NextResponse.json({ reply, matchedTopics: matches.map((m) => m.entry.id) });
    } catch (e) {
      console.error('[bot] OpenAI call failed, falling back to knowledge base:', e);
    }
  }

  if (matches.length > 0 && matches[0].score >= MIN_MATCH_SCORE) {
    return NextResponse.json({
      reply: matches[0].entry.answer,
      matchedTopics: matches.map((m) => m.entry.id),
    });
  }

  return NextResponse.json({ reply: getContactFallback(locale), matchedTopics: [] });
}

async function getAiReply(
  message: string,
  locale: Locale,
  entries: BotKnowledgeEntry[],
  apiKey: string,
): Promise<string> {
  const langNames: Record<Locale, string> = { fr: 'français', en: 'English', de: 'Deutsch' };
  const context = entries.length
    ? entries.map((e, i) => `${i + 1}. Q: ${e.question}\n   A: ${e.answer}`).join('\n')
    : 'No knowledge base entry matched this question — answer cautiously and invite the user to contact the organizers for anything you are not certain about.';

  const systemPrompt = [
    'You are "Level Up Bot", the assistant for the "Level Up in Germany" conference website.',
    'You answer questions from attendees ("participants") and speakers ("intervenants") about tickets, programme, venue and logistics.',
    `Reply in ${langNames[locale] ?? 'English'}, briefly (max 4-5 sentences), in a warm and professional tone.`,
    'Base your answer ONLY on the knowledge base context below. Never invent prices, dates or facts that are not in it.',
    "If the answer isn't covered by the context, say you're not sure and invite the person to contact the organizers at info@levelupingermany.com.",
    '',
    'Knowledge base:',
    context,
  ].join('\n');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.3,
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (typeof reply !== 'string' || !reply.trim()) {
    throw new Error('Empty OpenAI response');
  }
  return reply.trim();
}
