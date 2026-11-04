'use client';

import { useState } from 'react';

function ContactIcon({ name }: { name: 'whatsapp' | 'email' | 'copy' }) {
  if (name === 'whatsapp') {
    return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden><path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.5 0 .16 5.33.16 11.9c0 2.1.55 4.16 1.6 5.98L0 24l6.3-1.65a11.9 11.9 0 0 0 5.77 1.47h.01c6.57 0 11.91-5.34 11.91-11.91 0-3.18-1.24-6.17-3.47-8.43Zm-8.45 18.33h-.01a9.93 9.93 0 0 1-5.06-1.39l-.36-.21-3.74.98 1-3.64-.23-.38a9.9 9.9 0 0 1-1.52-5.27c0-5.47 4.45-9.92 9.92-9.92 2.65 0 5.14 1.03 7.01 2.91a9.86 9.86 0 0 1 2.91 7c0 5.47-4.45 9.92-9.92 9.92Zm5.44-7.41c-.3-.15-1.77-.88-2.04-.97-.27-.1-.46-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.64.07-.3-.15-1.24-.46-2.37-1.48-.87-.77-1.46-1.72-1.63-2.01-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.49.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.01-1.04 2.46s1.07 2.86 1.22 3.05c.15.2 2.1 3.2 5.09 4.48.71.31 1.26.49 1.69.62.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.69.25-1.29.17-1.42-.08-.12-.27-.2-.57-.35Z" /></svg>;
  }
  if (name === 'email') {
    return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" /><path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" /></svg>;
  }
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="6" y="4" width="12" height="16" rx="2" /><path strokeLinecap="round" d="M9 8h6M9 12h6M9 16h3" /></svg>;
}

export function LinksContactActions({ phone, email, whatsappLabel, emailLabel, copyPhoneLabel, copyEmailLabel }: {
  phone: string;
  email: string;
  whatsappLabel: string;
  emailLabel: string;
  copyPhoneLabel: string;
  copyEmailLabel: string;
}) {
  const [copied, setCopied] = useState<'phone' | 'email' | null>(null);

  async function copy(value: string, target: 'phone' | 'email') {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const input = document.createElement('textarea');
        input.value = value;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.focus();
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      setCopied(target);
      window.setTimeout(() => setCopied((current) => current === target ? null : current), 2200);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-3 rounded-2xl border border-[#25D366]/25 bg-[#25D366]/[0.08] p-4">
        <div>
          <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-[#071b0d] transition hover:bg-[#50e184] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]">
            <ContactIcon name="whatsapp" />{whatsappLabel}
          </a>
          <p className="mt-2 text-sm text-white/75">{phone}</p>
        </div>
        <button type="button" onClick={() => copy(phone, 'phone')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-[#25D366]/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]">
          <ContactIcon name="copy" />{copied === 'phone' ? 'Numéro copié' : copyPhoneLabel}
        </button>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div>
          <a href={`mailto:${email}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-accent/70 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><ContactIcon name="email" />{emailLabel}</a>
          <p className="mt-2 break-all text-sm text-white/75">{email}</p>
        </div>
        <button type="button" onClick={() => copy(email, 'email')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-accent/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          <ContactIcon name="copy" />{copied === 'email' ? 'Adresse copiée' : copyEmailLabel}
        </button>
      </div>
    </div>
  );
}
