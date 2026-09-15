'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { trackEvent } from '@/lib/analytics';

type Props = { locale: Locale };

type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
};

const TEXT: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    greeting: string;
    placeholder: string;
    send: string;
    typing: string;
    error: string;
    openLabel: string;
    closeLabel: string;
  }
> = {
  fr: {
    title: 'Level Up Bot',
    subtitle: 'Une question ? Je réponds aux participants et intervenants.',
    greeting:
      "Bonjour 👋 Je suis Level Up Bot. Posez-moi vos questions sur les billets, le programme, le lieu ou l'organisation !",
    placeholder: 'Écrivez votre question…',
    send: 'Envoyer',
    typing: 'Level Up Bot écrit…',
    error: "Une erreur est survenue. Réessayez ou écrivez à info@levelupingermany.com.",
    openLabel: 'Ouvrir Level Up Bot',
    closeLabel: 'Fermer Level Up Bot',
  },
  en: {
    title: 'Level Up Bot',
    subtitle: 'A question? I answer attendees and speakers.',
    greeting:
      "Hi 👋 I'm Level Up Bot. Ask me anything about tickets, the programme, the venue or the organisation!",
    placeholder: 'Type your question…',
    send: 'Send',
    typing: 'Level Up Bot is typing…',
    error: 'Something went wrong. Please try again or email info@levelupingermany.com.',
    openLabel: 'Open Level Up Bot',
    closeLabel: 'Close Level Up Bot',
  },
  de: {
    title: 'Level Up Bot',
    subtitle: 'Eine Frage? Ich antworte Teilnehmer:innen und Sprecher:innen.',
    greeting:
      'Hallo 👋 Ich bin Level Up Bot. Fragen Sie mich alles zu Tickets, Programm, Veranstaltungsort oder Organisation!',
    placeholder: 'Ihre Frage eingeben…',
    send: 'Senden',
    typing: 'Level Up Bot schreibt…',
    error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie an info@levelupingermany.com.',
    openLabel: 'Level Up Bot öffnen',
    closeLabel: 'Level Up Bot schließen',
  },
};

let messageIdCounter = 0;
function nextId(): string {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
}

export function LevelUpBot({ locale }: Props) {
  const t = TEXT[locale] ?? TEXT.en;
  const [open, setOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: nextId(), role: 'bot', text: t.greeting }]);
    }
  }, [open, messages.length, t.greeting]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const toggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && !hasOpenedOnce) {
        setHasOpenedOnce(true);
        trackEvent('bot_chat_open', { language: locale });
      }
      return next;
    });
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMessage: ChatMessage = { id: nextId(), role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);
    trackEvent('bot_chat_message', { language: locale });

    try {
      const res = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, locale }),
      });
      const data = await res.json();
      const reply = typeof data?.reply === 'string' && data.reply ? data.reply : t.error;
      setMessages((prev) => [...prev, { id: nextId(), role: 'bot', text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { id: nextId(), role: 'bot', text: t.error }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={open ? t.closeLabel : t.openLabel}
        className="fixed bottom-6 right-6 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:scale-105 hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {open ? (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 bottom-24 z-[70] mx-auto flex max-h-[70vh] w-auto flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[380px]">
          <div className="flex items-center gap-3 bg-gradient-to-r from-primary to-primary/80 px-4 py-3 text-white">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg">
              🤖
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold leading-tight">{t.title}</p>
              <p className="truncate text-xs text-white/80">{t.subtitle}</p>
            </div>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-primary text-white'
                      : 'rounded-bl-sm border border-black/5 bg-white text-neutral-800'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-black/5 bg-white px-3.5 py-2 text-sm italic text-neutral-400">
                  {t.typing}
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
            className="flex items-center gap-2 border-t border-black/5 bg-white px-3 py-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              maxLength={500}
              className="flex-1 rounded-full border border-black/10 px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition disabled:opacity-40"
              aria-label={t.send}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
