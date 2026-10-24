'use client';

import { useState } from 'react';
import { ResponsesTab } from './ResponsesTab';
import { SignupsTab } from './SignupsTab';

const TABS = [
  ['responses', 'Réponses'],
  ['signups', 'Inscriptions aux nouvelles'],
] as const;

export function FeedbackAdmin() {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('responses');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Section">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
              tab === key
                ? 'border-accent/60 bg-accent/15 text-accent'
                : 'border-white/15 bg-white/[0.04] text-white/70 hover:border-white/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'responses' && <ResponsesTab />}
      {tab === 'signups' && <SignupsTab />}
    </div>
  );
}
