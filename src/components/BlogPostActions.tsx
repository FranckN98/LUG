'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/config';

const COPY: Record<Locale, {
  like: string;
  liked: string;
  share: string;
  copy: string;
  copied: string;
  shareTitle: (t: string) => string;
}> = {
  fr: {
    like: 'J’aime',
    liked: 'Aimé',
    share: 'Partager',
    copy: 'Copier le lien',
    copied: 'Lien copié !',
    shareTitle: (t) => t,
  },
  en: {
    like: 'Like',
    liked: 'Liked',
    share: 'Share',
    copy: 'Copy link',
    copied: 'Link copied!',
    shareTitle: (t) => t,
  },
  de: {
    like: 'Gefällt mir',
    liked: 'Gefällt',
    share: 'Teilen',
    copy: 'Link kopieren',
    copied: 'Link kopiert!',
    shareTitle: (t) => t,
  },
};

type Props = {
  postId: string;
  postTitle: string;
  initialLikes: number;
  initialShares: number;
  locale: Locale;
};

export function BlogPostActions({ postId, postTitle, initialLikes, initialShares, locale }: Props) {
  const t = COPY[locale];
  const [likes, setLikes] = useState(initialLikes);
  const [shares, setShares] = useState(initialShares);
  const [liked, setLiked] = useState(false);
  const [busyLike, setBusyLike] = useState(false);
  const [copyHint, setCopyHint] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const m = document.cookie.match(new RegExp(`(?:^|; )blog_liked_${postId}=([^;]*)`));
    if (m && m[1] === '1') setLiked(true);
  }, [postId]);

  async function toggleLike() {
    if (busyLike) return;
    setBusyLike(true);
    try {
      const res = await fetch(`/api/blog/${postId}/like`, { method: liked ? 'DELETE' : 'POST' });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setLikes(typeof data.likes === 'number' ? data.likes : likes);
        setLiked(Boolean(data.liked));
      }
    } finally {
      setBusyLike(false);
    }
  }

  async function trackShare(channel: string) {
    try {
      const res = await fetch(`/api/blog/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok && typeof data.shares === 'number') setShares(data.shares);
    } catch {
      // ignore
    }
  }

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share) {
      try {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
          title: t.shareTitle(postTitle),
          url,
        });
        await trackShare('native');
        return;
      } catch {
        // user cancelled — fall through to menu
      }
    }
    setShowShareMenu((s) => !s);
  }

  async function copyLink() {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopyHint(true);
      window.setTimeout(() => setCopyHint(false), 1800);
      await trackShare('copy');
    } catch {
      // ignore
    }
  }

  function shareTo(channel: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'email') {
    if (typeof window === 'undefined') return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(postTitle);
    const map: Record<typeof channel, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      email: `mailto:?subject=${text}&body=${url}`,
    };
    window.open(map[channel], '_blank', 'noopener,noreferrer');
    void trackShare(channel);
    setShowShareMenu(false);
  }

  return (
    <div className="my-10 flex flex-wrap items-center gap-3 border-y border-gray-100 py-5">
      <button
        type="button"
        onClick={toggleLike}
        disabled={busyLike}
        aria-pressed={liked}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
          liked
            ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100'
            : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300'
        }`}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
        </svg>
        {liked ? t.liked : t.like}
        <span className="text-xs font-bold tabular-nums opacity-80">{likes}</span>
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50 hover:ring-gray-300"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {t.share}
          <span className="text-xs font-bold tabular-nums opacity-80">{shares}</span>
        </button>

        {showShareMenu && (
          <div className="absolute left-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5">
            <button onClick={copyLink} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
              <span aria-hidden>🔗</span> {copyHint ? t.copied : t.copy}
            </button>
            <button onClick={() => shareTo('whatsapp')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
              <span aria-hidden>💬</span> WhatsApp
            </button>
            <button onClick={() => shareTo('linkedin')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
              <span aria-hidden>in</span> LinkedIn
            </button>
            <button onClick={() => shareTo('facebook')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
              <span aria-hidden>f</span> Facebook
            </button>
            <button onClick={() => shareTo('twitter')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
              <span aria-hidden>𝕏</span> X / Twitter
            </button>
            <button onClick={() => shareTo('email')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
              <span aria-hidden>✉</span> Email
            </button>
          </div>
        )}
      </div>

      {copyHint && !showShareMenu && (
        <span className="text-xs font-medium text-emerald-600">{t.copied}</span>
      )}
    </div>
  );
}
