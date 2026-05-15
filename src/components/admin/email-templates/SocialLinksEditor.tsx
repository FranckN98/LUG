"use client";

import React, { useState } from "react";
import type { SocialLinks } from "@/types/emailTemplate";

interface Props {
  value: SocialLinks;
  onSave: (v: SocialLinks) => void;
  busy: boolean;
}

const FIELDS: { key: keyof SocialLinks; label: string; placeholder: string; type?: string }[] = [
  { key: "website", label: "Website", placeholder: "https://www.levelupingermany.com", type: "url" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://www.linkedin.com/company/…", type: "url" },
  { key: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/…", type: "url" },
  { key: "tiktok", label: "TikTok", placeholder: "https://www.tiktok.com/@…", type: "url" },
  { key: "youtube", label: "YouTube (optional)", placeholder: "https://www.youtube.com/@…", type: "url" },
  { key: "whatsapp", label: "WhatsApp channel (optional)", placeholder: "https://whatsapp.com/channel/…", type: "url" },
  { key: "email", label: "Contact email", placeholder: "contact@levelupingermany.com", type: "email" },
];

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-[#1A1A1A] focus:outline-none focus:border-[#E98C0B] focus:ring-2 focus:ring-[#E98C0B]/20";

export function SocialLinksEditor({ value, onSave, busy }: Props) {
  const [draft, setDraft] = useState<SocialLinks>(value);
  const [dirty, setDirty] = useState(false);

  function update<K extends keyof SocialLinks>(key: K, v: SocialLinks[K]) {
    setDraft((prev) => ({ ...prev, [key]: v }));
    setDirty(true);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-3xl">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Social footer</h2>
      <p className="text-xs text-gray-500 mb-6">
        These links appear automatically in the footer of every email template.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key} className={f.key === "email" ? "sm:col-span-2" : ""}>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              {f.label}
            </label>
            <input
              type={f.type || "text"}
              value={draft[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
              placeholder={f.placeholder}
              className={inputCls}
            />
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-2">
        <button
          onClick={() => {
            onSave(draft);
            setDirty(false);
          }}
          disabled={busy || !dirty}
          className="text-sm font-semibold px-5 py-2.5 bg-[#8C1A1A] hover:bg-[#6b1414] text-white rounded-lg disabled:opacity-50 transition"
        >
          {busy ? "Saving…" : "Save social links"}
        </button>
        {dirty && (
          <button
            onClick={() => {
              setDraft(value);
              setDirty(false);
            }}
            className="text-sm font-semibold px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
