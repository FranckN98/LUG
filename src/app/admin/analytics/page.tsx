'use client';

import { useEffect, useState } from 'react';

type AnalyticsResponse = {
  ok: boolean;
  range: string;
  totals: { events: number; pageViews: number; uniqueVisitors: number };
  topPages: Array<{ page: string; views: number }>;
  topSources: Array<{ source: string; count: number }>;
  topCampaigns: Array<{ utm_source: string | null; utm_campaign: string | null; count: number }>;
  eventBreakdown: Array<{ name: string; count: number }>;
  daily: Array<{ day: string; views: number; visitors: number }>;
};

const RANGES: Array<{ key: string; label: string }> = [
  { key: '24h', label: '24 h' },
  { key: '7d', label: '7 jours' },
  { key: '30d', label: '30 jours' },
  { key: '90d', label: '90 jours' },
];

const EVENT_LABELS: Record<string, string> = {
  newsletter_signup: 'Newsletter',
  contact_form_submit: 'Contact',
  sponsor_form_submit: 'Sponsors',
  member_registration: 'Membres',
  event_popup_email_submit: 'Pop-up event',
  ticket_button_click: 'Tickets',
  partner_button_click: 'Partenaires',
  speaker_apply_click: 'Speakers',
  blog_like: 'Blog likes',
  blog_share: 'Blog partages',
  cta_click: 'CTA',
};

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics?range=${range}`, { cache: 'no-store' });
        const json = (await res.json()) as AnalyticsResponse;
        if (!cancelled && json.ok) setData(json);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div className="px-4 py-8 md:px-10 md:py-10 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-accent/70">Analytics</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Suivi de trafic</h1>
          <p className="mt-1 text-sm text-white/55 max-w-2xl">
            Visiteurs uniques, sources, campagnes UTM et événements clés. Données hébergées localement, sans cookies tiers.
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                range === r.key ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <p className="text-sm text-white/50">Chargement…</p>
      ) : !data ? (
        <p className="text-sm text-rose-400">Erreur de chargement.</p>
      ) : (
        <div className="space-y-8">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Kpi label="Visiteurs uniques" value={data.totals.uniqueVisitors} />
            <Kpi label="Pages vues" value={data.totals.pageViews} />
            <Kpi label="Événements" value={data.totals.events} />
          </div>

          {/* Daily chart */}
          <Card title="Trafic par jour">
            <DailyChart data={data.daily} />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="Pages les plus consultées">
              <RankList items={data.topPages.map((p) => ({ label: p.page, value: p.views }))} />
            </Card>
            <Card title="Sources de trafic">
              <RankList items={data.topSources.map((s) => ({ label: s.source, value: s.count }))} />
            </Card>
          </div>

          <Card title="Campagnes UTM">
            {data.topCampaigns.length === 0 ? (
              <p className="text-sm text-white/40">Aucune campagne tracée sur la période.</p>
            ) : (
              <RankList
                items={data.topCampaigns.map((c) => ({
                  label: `${c.utm_source ?? '—'} · ${c.utm_campaign ?? '—'}`,
                  value: c.count,
                }))}
              />
            )}
          </Card>

          <Card title="Conversions & événements">
            {data.eventBreakdown.length === 0 ? (
              <p className="text-sm text-white/40">Aucun événement enregistré.</p>
            ) : (
              <RankList
                items={data.eventBreakdown.map((e) => ({
                  label: EVENT_LABELS[e.name] ?? e.name,
                  value: e.count,
                }))}
              />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-white/45">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white tabular-nums">{value.toLocaleString('fr-FR')}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-sm font-bold text-white mb-4">{title}</h2>
      {children}
    </section>
  );
}

function RankList({ items }: { items: Array<{ label: string; value: number }> }) {
  if (items.length === 0) return <p className="text-sm text-white/40">Aucune donnée.</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={`${item.label}-${i}`} className="text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-white/80" title={item.label}>{item.label}</span>
            <span className="shrink-0 tabular-nums font-semibold text-white">{item.value.toLocaleString('fr-FR')}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-primary"
              style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function DailyChart({ data }: { data: Array<{ day: string; views: number; visitors: number }> }) {
  if (data.length === 0) return <p className="text-sm text-white/40">Aucune visite sur la période.</p>;
  const max = Math.max(...data.map((d) => d.views), 1);
  return (
    <div className="flex items-end gap-1 h-36">
      {data.map((d) => {
        const h = Math.round((d.views / max) * 100);
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative flex-1 w-full flex items-end">
              <div
                className="w-full rounded-t bg-gradient-to-t from-primary to-accent transition group-hover:opacity-80"
                style={{ height: `${Math.max(4, h)}%` }}
                title={`${d.day} · ${d.views} vues · ${d.visitors} visiteurs`}
              />
            </div>
            <span className="text-[0.55rem] text-white/35 tabular-nums">
              {d.day.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
