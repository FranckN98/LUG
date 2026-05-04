'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

/**
 * Lightweight contentEditable rich-text editor tuned for HTML email bodies.
 * Toolbar inserts inline-styled snippets (compatible with email clients).
 *
 * Supports: bold/italic/underline, headings, lists, link, image, button,
 * divider, quote, clear formatting, and a raw-HTML toggle.
 */
export function NewsletterRichEditor({ value, onChange, placeholder, minHeight = 240 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [showHtml, setShowHtml] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState(value);

  // Sync external value -> DOM (only when the editor is not focused, to avoid
  // wiping the user's caret position on each keystroke).
  useEffect(() => {
    if (showHtml) {
      setHtmlDraft(value);
      return;
    }
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value, showHtml]);

  const emit = useCallback(() => {
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  const exec = useCallback(
    (cmd: string, arg?: string) => {
      ref.current?.focus();
      document.execCommand(cmd, false, arg);
      emit();
    },
    [emit],
  );

  const insertHtml = useCallback(
    (html: string) => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      const ok = document.execCommand('insertHTML', false, html);
      if (!ok) {
        // Fallback: append at end
        el.innerHTML += html;
      }
      emit();
    },
    [emit],
  );

  const addLink = () => {
    const sel = window.getSelection();
    const hasText = sel && !sel.isCollapsed;
    const url = window.prompt('URL du lien :', 'https://');
    if (!url) return;
    if (hasText) {
      exec('createLink', url);
      // execCommand createLink doesn't add target/style; patch the just-created link.
      requestAnimationFrame(() => {
        const links = ref.current?.querySelectorAll('a:not([data-styled])');
        links?.forEach((a) => {
          a.setAttribute('data-styled', '1');
          (a as HTMLAnchorElement).style.color = '#8C1A1A';
          (a as HTMLAnchorElement).style.textDecoration = 'underline';
          (a as HTMLAnchorElement).target = '_blank';
          (a as HTMLAnchorElement).rel = 'noopener noreferrer';
        });
        emit();
      });
    } else {
      const label = window.prompt('Texte du lien :', url) || url;
      insertHtml(
        `<a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" data-styled="1" style="color:#8C1A1A;text-decoration:underline">${escapeText(label)}</a>`,
      );
    }
  };

  const addImage = () => {
    const url = window.prompt('URL de l\u2019image (https://…) :', 'https://');
    if (!url) return;
    const alt = window.prompt('Texte alternatif (description) :', '') || '';
    insertHtml(
      `<p style="margin:18px 0;text-align:center"><img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" style="display:inline-block;max-width:100%;height:auto;border:0;border-radius:12px" /></p>`,
    );
  };

  const addButton = () => {
    const label = window.prompt('Texte du bouton :', 'En savoir plus');
    if (!label) return;
    const url = window.prompt('URL du bouton :', 'https://');
    if (!url) return;
    insertHtml(
      `<p style="text-align:center;margin:28px 0"><a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#8C1A1A;color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.03em">${escapeText(label)}</a></p>`,
    );
  };

  const addDivider = () =>
    insertHtml(`<hr style="border:none;border-top:1px solid #e8d8d8;margin:28px 0" />`);

  const addQuote = () =>
    insertHtml(
      `<blockquote style="margin:18px 0;padding:12px 16px;border-left:3px solid #8C1A1A;background:#fafafa;color:#444;font-style:italic">Votre citation…</blockquote>`,
    );

  const addHeading = (level: 2 | 3) => {
    exec('formatBlock', `H${level}`);
    // Apply email-friendly inline styles to fresh headings
    requestAnimationFrame(() => {
      const headings = ref.current?.querySelectorAll(`h${level}:not([data-styled])`);
      headings?.forEach((h) => {
        h.setAttribute('data-styled', '1');
        const el = h as HTMLElement;
        if (level === 2) {
          el.style.cssText =
            'margin:24px 0 12px;font-size:22px;font-weight:800;color:#1a1a1a;line-height:1.25;letter-spacing:-0.01em';
        } else {
          el.style.cssText =
            'margin:18px 0 8px;font-size:17px;font-weight:700;color:#1a1a1a;line-height:1.3';
        }
      });
      emit();
    });
  };

  const clearFormatting = () => {
    exec('removeFormat');
    exec('formatBlock', 'P');
  };

  const applyHtmlDraft = () => {
    onChange(htmlDraft);
    setShowHtml(false);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0e0606] overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-[#160808] px-2 py-2 text-[12px]">
        <ToolbarBtn onClick={() => exec('bold')} title="Gras (Ctrl+B)"><strong>B</strong></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('italic')} title="Italique (Ctrl+I)"><em>I</em></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('underline')} title="Souligné"><span style={{ textDecoration: 'underline' }}>U</span></ToolbarBtn>
        <Sep />
        <ToolbarBtn onClick={() => addHeading(2)} title="Titre 2">H2</ToolbarBtn>
        <ToolbarBtn onClick={() => addHeading(3)} title="Titre 3">H3</ToolbarBtn>
        <ToolbarBtn onClick={() => exec('formatBlock', 'P')} title="Paragraphe">¶</ToolbarBtn>
        <Sep />
        <ToolbarBtn onClick={() => exec('insertUnorderedList')} title="Liste à puces">• Liste</ToolbarBtn>
        <ToolbarBtn onClick={() => exec('insertOrderedList')} title="Liste numérotée">1. Liste</ToolbarBtn>
        <ToolbarBtn onClick={addQuote} title="Citation">❝ Citation</ToolbarBtn>
        <Sep />
        <ToolbarBtn onClick={addLink} title="Insérer un lien">🔗 Lien</ToolbarBtn>
        <ToolbarBtn onClick={addImage} title="Insérer une image">🖼️ Image</ToolbarBtn>
        <ToolbarBtn onClick={addButton} title="Insérer un bouton">🔘 Bouton</ToolbarBtn>
        <ToolbarBtn onClick={addDivider} title="Séparateur horizontal">─ Séparateur</ToolbarBtn>
        <Sep />
        <ToolbarBtn onClick={clearFormatting} title="Effacer la mise en forme">⟲ Effacer</ToolbarBtn>
        <div className="ml-auto" />
        <button
          type="button"
          onClick={() => {
            if (!showHtml && ref.current) setHtmlDraft(ref.current.innerHTML);
            setShowHtml((v) => !v);
          }}
          className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
            showHtml ? 'bg-accent text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
          }`}
          title="Voir / éditer le HTML brut"
        >
          {showHtml ? '✓ Appliquer HTML' : '</> HTML'}
        </button>
      </div>

      {/* Editor or HTML view */}
      {showHtml ? (
        <div className="p-3">
          <textarea
            value={htmlDraft}
            onChange={(e) => setHtmlDraft(e.target.value)}
            className="w-full bg-[#080404] text-white/90 rounded-md border border-white/10 p-3 font-mono text-[12px] leading-relaxed"
            style={{ minHeight }}
            spellCheck={false}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowHtml(false)}
              className="rounded-md bg-white/10 px-3 py-1.5 text-[12px] text-white/80 hover:bg-white/20"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={applyHtmlDraft}
              className="rounded-md bg-accent px-3 py-1.5 text-[12px] font-semibold text-white hover:opacity-90"
            >
              Appliquer
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          onPaste={(e) => {
            // Prefer plain text on paste to keep email-friendly markup.
            if (e.clipboardData.types.includes('text/html')) return; // allow rich paste
            const text = e.clipboardData.getData('text/plain');
            if (!text) return;
            e.preventDefault();
            document.execCommand('insertText', false, text);
          }}
          data-placeholder={placeholder || 'Rédigez votre message…'}
          className="newsletter-rte w-full bg-white text-[#1a1a1a] px-5 py-4 outline-none focus:ring-2 focus:ring-accent/50 text-[15px] leading-relaxed"
          style={{ minHeight }}
        />
      )}

      <style jsx>{`
        :global(.newsletter-rte:empty::before) {
          content: attr(data-placeholder);
          color: #999;
          pointer-events: none;
        }
        :global(.newsletter-rte p) {
          margin: 0 0 14px;
        }
        :global(.newsletter-rte a) {
          color: #8c1a1a;
          text-decoration: underline;
        }
        :global(.newsletter-rte img) {
          max-width: 100%;
          height: auto;
          border-radius: 10px;
        }
        :global(.newsletter-rte ul, .newsletter-rte ol) {
          margin: 0 0 14px;
          padding-left: 24px;
        }
        :global(.newsletter-rte blockquote) {
          margin: 14px 0;
          padding: 10px 14px;
          border-left: 3px solid #8c1a1a;
          background: #faf5f5;
          color: #444;
          font-style: italic;
        }
        :global(.newsletter-rte h2) {
          margin: 20px 0 10px;
          font-size: 22px;
          font-weight: 800;
          line-height: 1.25;
        }
        :global(.newsletter-rte h3) {
          margin: 16px 0 8px;
          font-size: 17px;
          font-weight: 700;
          line-height: 1.3;
        }
        :global(.newsletter-rte hr) {
          border: none;
          border-top: 1px solid #e8d8d8;
          margin: 22px 0;
        }
      `}</style>
    </div>
  );
}

function ToolbarBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault() /* keep selection */}
      onClick={onClick}
      title={title}
      className="rounded-md border border-white/5 bg-white/5 px-2 py-1 text-white/80 hover:bg-white/15 hover:text-white transition-colors"
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-white/10" aria-hidden />;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
