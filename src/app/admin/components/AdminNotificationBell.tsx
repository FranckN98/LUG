'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

type RecentMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
};
type RecentMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};
type RecentInteraction = {
  id: string;
  type: string;
  shareChannel: string | null;
  createdAt: string;
  blogPost: { id: string; title: string } | null;
};
type NotificationsResponse = {
  ok: boolean;
  counts: { members: number; messages: number; blog: number; total: number };
  items: { members: RecentMember[]; messages: RecentMessage[]; blog: RecentInteraction[] };
};

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const dd = Math.floor(h / 24);
  if (dd < 7) return `il y a ${dd} j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'members' | 'messages' | 'blog'>('members');
  const containerRef = useRef<HTMLDivElement | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const json = (await res.json()) as NotificationsResponse;
      if (json.ok) setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = window.setInterval(fetchNotifications, 60_000);
    return () => window.clearInterval(id);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  useEffect(() => {
    if (!data) return;
    if (data.counts.members > 0) setTab('members');
    else if (data.counts.messages > 0) setTab('messages');
    else if (data.counts.blog > 0) setTab('blog');
  }, [data?.counts.members, data?.counts.messages, data?.counts.blog, data]);

  const total = data?.counts.total ?? 0;

  async function markSeen(categories: string[]) {
    await fetch('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories }),
    });
    await fetchNotifications();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 active:scale-95"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {total > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-[1.15rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[0.6rem] font-bold text-white ring-2 ring-[#130707]">
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[22rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#1b0c0c] shadow-2xl ring-1 ring-black/40">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <div>
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-accent/70">Notifications</p>
              <p className="text-sm font-semibold text-white">{total > 0 ? `${total} en attente` : 'Tout est à jour'}</p>
            </div>
            {(data?.counts.messages ?? 0) + (data?.counts.blog ?? 0) > 0 && (
              <button
                onClick={() => markSeen(['messages', 'blog'])}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[0.65rem] font-semibold text-white/70 hover:bg-white/10"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="flex border-b border-white/8 text-xs">
            {(['members', 'messages', 'blog'] as const).map((k) => {
              const c = data?.counts[k] ?? 0;
              const labels: Record<typeof k, string> = { members: 'Membres', messages: 'Messages', blog: 'Blog' };
              const isActive = tab === k;
              return (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`flex-1 px-3 py-2.5 font-semibold transition ${
                    isActive ? 'bg-white/5 text-white' : 'text-white/45 hover:text-white/70'
                  }`}
                >
                  <span>{labels[k]}</span>
                  {c > 0 && (
                    <span className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 text-[0.55rem] font-bold ${
                      isActive ? 'bg-rose-500 text-white' : 'bg-white/10 text-white/70'
                    }`}>
                      {c}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="max-h-80 overflow-y-auto px-2 py-2">
            {loading && !data ? (
              <p className="px-3 py-6 text-center text-xs text-white/40">Chargement…</p>
            ) : tab === 'members' ? (
              <MembersList items={data?.items.members ?? []} />
            ) : tab === 'messages' ? (
              <MessagesList items={data?.items.messages ?? []} onMarkSeen={() => markSeen(['messages'])} />
            ) : (
              <BlogList items={data?.items.blog ?? []} onMarkSeen={() => markSeen(['blog'])} />
            )}
          </div>

          <div className="border-t border-white/8 bg-black/20 px-3 py-2">
            <Link
              href={tab === 'members' ? '/admin/members' : tab === 'blog' ? '/admin/blog' : '/admin'}
              onClick={() => setOpen(false)}
              className="block w-full rounded-lg px-3 py-1.5 text-center text-xs font-semibold text-accent hover:bg-white/5"
            >
              {tab === 'members' ? 'Voir tous les membres' : tab === 'blog' ? 'Gérer le blog' : 'Aller au dashboard'} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="px-3 py-6 text-center text-xs text-white/35">{children}</p>;
}

function MembersList({ items }: { items: RecentMember[] }) {
  if (items.length === 0) return <EmptyHint>Aucune nouvelle demande.</EmptyHint>;
  return (
    <ul className="space-y-1">
      {items.map((m) => (
        <li key={m.id}>
          <Link
            href="/admin/members"
            className="block rounded-xl px-3 py-2.5 hover:bg-white/5"
          >
            <p className="truncate text-sm font-semibold text-white">
              {m.firstName} {m.lastName}
            </p>
            <p className="truncate text-[0.7rem] text-white/50">{m.email}</p>
            <p className="mt-0.5 text-[0.65rem] text-accent/80">{formatRelative(m.createdAt)} · nouvelle demande</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MessagesList({ items, onMarkSeen }: { items: RecentMessage[]; onMarkSeen: () => void }) {
  if (items.length === 0) return <EmptyHint>Aucun message non lu.</EmptyHint>;
  return (
    <ul className="space-y-1">
      {items.map((m) => (
        <li key={m.id} className="rounded-xl px-3 py-2.5 hover:bg-white/5">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-white">{m.name}</p>
            <button
              onClick={onMarkSeen}
              className="shrink-0 text-[0.6rem] font-semibold text-white/40 hover:text-white"
            >
              Marquer lu
            </button>
          </div>
          <p className="truncate text-[0.7rem] text-white/50">{m.email}</p>
          <p className="mt-1 line-clamp-2 text-[0.7rem] text-white/65">{m.message}</p>
          <p className="mt-0.5 text-[0.6rem] text-accent/70">{formatRelative(m.createdAt)}</p>
        </li>
      ))}
    </ul>
  );
}

function BlogList({ items, onMarkSeen }: { items: RecentInteraction[]; onMarkSeen: () => void }) {
  if (items.length === 0) return <EmptyHint>Aucune interaction blog récente.</EmptyHint>;
  return (
    <ul className="space-y-1">
      {items.map((it) => (
        <li key={it.id} className="rounded-xl px-3 py-2.5 hover:bg-white/5">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-white">
              {it.type === 'like' ? '❤️ Like' : '🔗 Partage'}
              {it.shareChannel && it.type === 'share' ? ` · ${it.shareChannel}` : ''}
            </p>
            <button
              onClick={onMarkSeen}
              className="shrink-0 text-[0.6rem] font-semibold text-white/40 hover:text-white"
            >
              Marquer lu
            </button>
          </div>
          <p className="truncate text-[0.7rem] text-white/50">
            {it.blogPost?.title ?? '(article supprimé)'}
          </p>
          <p className="mt-0.5 text-[0.6rem] text-accent/70">{formatRelative(it.createdAt)}</p>
        </li>
      ))}
    </ul>
  );
}
