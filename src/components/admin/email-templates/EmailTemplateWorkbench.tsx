"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MANDATORY_BCC,
  LANGUAGES,
  LANGUAGE_LABELS,
  type ContactCategory,
  type Language,
} from "@/types/emailTemplate";
import { fetchEmailPreviewHtml } from "@/lib/emailTemplatesApi";
import { detectVariables } from "@/lib/emailVariables";
import type { Draft } from "./EmailTemplatesShell";

interface Props {
  draft: Draft;
  onDraftChange: (d: Draft) => void;
  applyCategoryFully: (c: ContactCategory, l: Language) => void;
  dirty: boolean;
  busy: boolean;
  isExisting: boolean;
  onSave: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSend: (
    mode: "send" | "test",
    r: { to: string; cc: string[]; bcc: string[] },
    variables: Record<string, string>,
  ) => void;
  categories: readonly ContactCategory[];
}

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-[#1A1A1A] focus:outline-none focus:border-[#E98C0B] focus:ring-2 focus:ring-[#E98C0B]/20 transition";
const labelCls = "block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5";

const VARIABLE_PLACEHOLDERS: Record<string, string> = {
  firstName: "Jane",
  lastName: "Doe",
  fullName: "Jane Doe",
  companyName: "Acme GmbH",
  organizationName: "Acme Foundation",
  eventName: "Berlin Edition",
  eventDate: "April 19, 2026",
  eventCity: "Berlin",
  eventLocation: "Kreuzberg HQ",
  panelTopic: "Building a career in Germany",
  businessField: "African luxury skincare",
  fieldOrTopic: "fintech for the diaspora",
  topic: "our last conversation",
  lastEventParticipants: "120",
};

function parseEmails(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function EmailTemplateWorkbench(props: Props) {
  const { draft, onDraftChange, applyCategoryFully, dirty, busy, isExisting } = props;
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [to, setTo] = useState("");
  const [ccRaw, setCcRaw] = useState("");
  const [bccRaw, setBccRaw] = useState("");
  const [confirmSend, setConfirmSend] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});

  // For new drafts (no id), auto-load the preset when category or language changes.
  // Stops auto-loading once the user manually edits subject/body/CTA fields.
  const userEditedRef = useRef(false);

  const detectedVars = useMemo(
    () => detectVariables(draft.subject, draft.body, draft.ctaText, draft.ctaLink),
    [draft.subject, draft.body, draft.ctaText, draft.ctaLink],
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      setPreviewLoading(true);
      void fetchEmailPreviewHtml(
        {
          name: draft.name,
          category: draft.category,
          language: draft.language,
          subject: draft.subject,
          body: draft.body,
          ctaText: draft.ctaText,
          ctaLink: draft.ctaLink,
          headerImageUrl: draft.headerImageUrl,
          footerContact: draft.footerContact,
          signature: draft.signature,
        },
        variables,
      )
        .then(setPreviewHtml)
        .catch(() => setPreviewHtml("<p style='padding:24px;color:#888'>Preview unavailable</p>"))
        .finally(() => setPreviewLoading(false));
    }, 400);
    return () => clearTimeout(handle);
  }, [
    draft.name,
    draft.category,
    draft.language,
    draft.subject,
    draft.body,
    draft.ctaText,
    draft.ctaLink,
    draft.headerImageUrl,
    draft.footerContact,
    draft.signature,
    variables,
  ]);

  const ccList = useMemo(() => parseEmails(ccRaw), [ccRaw]);
  const bccList = useMemo(() => parseEmails(bccRaw), [bccRaw]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    if (key === "subject" || key === "body" || key === "ctaText" || key === "ctaLink") {
      userEditedRef.current = true;
    }
    onDraftChange({ ...draft, [key]: value });
  }

  function handleCategoryChange(cat: ContactCategory) {
    if (!isExisting && !userEditedRef.current) {
      applyCategoryFully(cat, draft.language);
    } else {
      onDraftChange({ ...draft, category: cat });
    }
  }

  function handleLanguageChange(lang: Language) {
    if (!isExisting && !userEditedRef.current) {
      applyCategoryFully(draft.category, lang);
    } else {
      onDraftChange({ ...draft, language: lang });
    }
  }

  function handleUseSuggested() {
    applyCategoryFully(draft.category, draft.language);
    userEditedRef.current = false;
  }

  function handleSendClick(mode: "send" | "test") {
    if (!to.trim()) {
      alert("Please enter a recipient email in the To field.");
      return;
    }
    if (mode === "send" && !confirmSend) {
      setConfirmSend(true);
      return;
    }
    props.onSend(mode, { to: to.trim(), cc: ccList, bcc: bccList }, variables);
    setConfirmSend(false);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap items-center gap-2 sticky top-0 z-10">
        <input
          type="text"
          value={draft.name}
          onChange={(e) => onDraftChange({ ...draft, name: e.target.value })}
          className="flex-1 min-w-[200px] border-0 text-base font-semibold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E98C0B]/30 rounded px-2 py-1"
          placeholder="Template name"
        />
        {dirty && (
          <span className="text-xs text-[#E98C0B] font-semibold uppercase tracking-wider">Unsaved</span>
        )}
        <button
          onClick={props.onDuplicate}
          disabled={busy}
          className="text-sm font-semibold px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Duplicate
        </button>
        {isExisting && (
          <button
            onClick={props.onDelete}
            disabled={busy}
            className="text-sm font-semibold px-3 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        )}
        <button
          onClick={props.onSave}
          disabled={busy || !dirty}
          className="text-sm font-semibold px-4 py-2 bg-[#8C1A1A] hover:bg-[#6b1414] text-white rounded-lg disabled:opacity-50 transition"
        >
          {busy ? "Saving…" : isExisting ? "Save changes" : "Save template"}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-4">Content</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Contact category</label>
                <div className="flex gap-2">
                  <select
                    value={draft.category}
                    onChange={(e) => handleCategoryChange(e.target.value as ContactCategory)}
                    className={inputCls}
                  >
                    {props.categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleUseSuggested}
                    title="Replace subject, body and CTA with the recommended template for this category + language"
                    className="whitespace-nowrap text-xs font-semibold px-3 py-2 border border-[#E98C0B]/40 text-[#c77409] rounded-lg hover:bg-[#fff4e3]"
                  >
                    Use suggested
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Pick a category and the matching template loads automatically. Only the language remains to choose below.
                </p>
              </div>

              <div>
                <label className={labelCls}>Language</label>
                <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => handleLanguageChange(l)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition ${
                        draft.language === l
                          ? "bg-[#8C1A1A] text-white shadow-sm"
                          : "text-gray-600 hover:text-[#1A1A1A]"
                      }`}
                      aria-pressed={draft.language === l}
                    >
                      {l} · {LANGUAGE_LABELS[l]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Email subject</label>
                <input
                  type="text"
                  value={draft.subject}
                  onChange={(e) => update("subject", e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Invitation to Level Up in Germany"
                />
              </div>
              <div>
                <label className={labelCls}>Body</label>
                <textarea
                  value={draft.body}
                  onChange={(e) => update("body", e.target.value)}
                  rows={14}
                  className={`${inputCls} font-sans leading-relaxed resize-y`}
                  placeholder="Write your message. Plain paragraphs are auto-formatted. Use {firstName}, {eventDate}, etc. as variables."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Tip: Use <span className="font-mono">{"{firstName}"}</span>,{" "}
                  <span className="font-mono">{"{eventDate}"}</span> and other placeholders — fill them in the Variables panel below.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>CTA button text</label>
                  <input
                    type="text"
                    value={draft.ctaText}
                    onChange={(e) => update("ctaText", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Schedule a call"
                  />
                </div>
                <div>
                  <label className={labelCls}>CTA button link</label>
                  <input
                    type="url"
                    value={draft.ctaLink}
                    onChange={(e) => update("ctaLink", e.target.value)}
                    className={inputCls}
                    placeholder="https://…"
                  />
                </div>
              </div>
            </div>
          </section>

          {detectedVars.length > 0 && (
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Variables</h2>
              <p className="text-xs text-gray-500 mb-4">
                These placeholders were detected in your template. Provide values to personalize the email before sending.
                Social URLs (<span className="font-mono">{"{websiteUrl}"}</span>, <span className="font-mono">{"{linkedInUrl}"}</span>, …) are filled automatically from the Social Footer tab.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detectedVars.map((name) => (
                  <div key={name}>
                    <label className={labelCls}>{`{${name}}`}</label>
                    <input
                      type="text"
                      value={variables[name] ?? ""}
                      onChange={(e) =>
                        setVariables((prev) => ({ ...prev, [name]: e.target.value }))
                      }
                      className={inputCls}
                      placeholder={VARIABLE_PLACEHOLDERS[name] ?? `Value for ${name}`}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-4">Branding</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Header image / logo URL</label>
                <input
                  type="url"
                  value={draft.headerImageUrl}
                  onChange={(e) => onDraftChange({ ...draft, headerImageUrl: e.target.value })}
                  className={inputCls}
                  placeholder="Leave empty to use /logo.png"
                />
              </div>
              <div>
                <label className={labelCls}>Footer contact info</label>
                <input
                  type="text"
                  value={draft.footerContact}
                  onChange={(e) => onDraftChange({ ...draft, footerContact: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Level Up in Germany"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Social links and the contact email come from the Social Footer tab and apply to every template automatically.
                </p>
              </div>
              <div>
                <label className={labelCls}>Signature (sign-off)</label>
                <textarea
                  value={draft.signature ?? ""}
                  onChange={(e) => onDraftChange({ ...draft, signature: e.target.value })}
                  className={`${inputCls} min-h-[68px] resize-y leading-snug`}
                  placeholder={"Leave empty for the default team signature\nExample:\nFranck Ngami\nFounder, Level Up in Germany"}
                  rows={3}
                />
                <p className="mt-1 text-xs text-gray-500">
                  This replaces the bold name under the closing line ("Mit freundlichen Grüßen" / "Best regards" / "Cordialement"). Line breaks are preserved. You can use variables like <code className="font-mono">{"{firstName}"}</code>.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-4">Recipients</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>To</label>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className={inputCls}
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className={labelCls}>CC (one per line or comma-separated)</label>
                <textarea
                  value={ccRaw}
                  onChange={(e) => setCcRaw(e.target.value)}
                  className={inputCls}
                  rows={2}
                  placeholder="alice@example.com, bob@example.com"
                />
                {ccList.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">{ccList.length} CC recipient(s)</p>
                )}
              </div>
              <div>
                <label className={labelCls}>BCC</label>
                <textarea
                  value={bccRaw}
                  onChange={(e) => setBccRaw(e.target.value)}
                  className={inputCls}
                  rows={2}
                  placeholder="Additional BCC addresses"
                />
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-[#fff4e3] border border-[#E98C0B]/30 rounded-lg">
                  <svg className="w-4 h-4 text-[#c77409] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs text-[#7a4a08] font-medium">
                    <span className="font-mono">{MANDATORY_BCC}</span> is always added to BCC and cannot be removed.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => handleSendClick("test")}
                  disabled={busy}
                  className="text-sm font-semibold px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Send test email
                </button>
                {!confirmSend ? (
                  <button
                    onClick={() => handleSendClick("send")}
                    disabled={busy}
                    className="text-sm font-semibold px-5 py-2.5 bg-[#E98C0B] hover:bg-[#c77409] text-white rounded-lg disabled:opacity-50 transition"
                  >
                    Send email
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleSendClick("send")}
                      disabled={busy}
                      className="text-sm font-semibold px-5 py-2.5 bg-[#8C1A1A] hover:bg-[#6b1414] text-white rounded-lg disabled:opacity-50 transition"
                    >
                      Confirm &amp; send
                    </button>
                    <button
                      onClick={() => setConfirmSend(false)}
                      className="text-sm font-semibold px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 sticky top-20">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">
                Live preview <span className="ml-2 text-[10px] font-bold text-[#8C1A1A]">{draft.language.toUpperCase()}</span>
              </h2>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`text-xs font-semibold px-3 py-1 rounded ${previewMode === "desktop" ? "bg-white shadow-sm" : "text-gray-500"}`}
                >
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`text-xs font-semibold px-3 py-1 rounded ${previewMode === "mobile" ? "bg-white shadow-sm" : "text-gray-500"}`}
                >
                  Mobile
                </button>
              </div>
            </div>
            <div className={`mx-auto bg-[#f7f4ef] rounded-lg overflow-hidden border border-gray-200 transition-all ${previewMode === "mobile" ? "max-w-[380px]" : "max-w-full"}`}>
              {previewLoading && !previewHtml ? (
                <div className="h-[600px] flex items-center justify-center text-xs text-gray-400">Rendering preview…</div>
              ) : (
                <iframe
                  title="Email preview"
                  srcDoc={previewHtml}
                  sandbox=""
                  className="w-full h-[720px] bg-white border-0"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
