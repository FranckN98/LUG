"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  fetchEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  fetchEmailHistory,
  fetchEmailSocialLinks,
  updateEmailSocialLinks,
  sendEmail,
} from "@/lib/emailTemplatesApi";
import {
  CONTACT_CATEGORIES,
  MANDATORY_BCC,
  type ContactCategory,
  type EmailTemplate,
  type EmailSendHistory,
  type SocialLinks,
  type Language,
} from "@/types/emailTemplate";
import { CATEGORY_TEMPLATES } from "@/lib/emailCategoryTemplates";
import { EmailTemplateWorkbench } from "./EmailTemplateWorkbench";
import { EmailHistoryTable } from "./EmailHistoryTable";
import { SocialLinksEditor } from "./SocialLinksEditor";

type Tab = "templates" | "history" | "social";

export type Draft = Omit<EmailTemplate, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

function emptyDraft(category: ContactCategory = "Event guest", language: Language = "en"): Draft {
  const d = CATEGORY_TEMPLATES[category][language];
  return {
    name: "Untitled template",
    category,
    language,
    subject: d.subject,
    body: d.body,
    ctaText: d.ctaText,
    ctaLink: d.ctaLink,
    headerImageUrl: "",
    footerContact: "Level Up in Germany",
    signature: "",
  };
}

export function EmailTemplatesShell() {
  const [tab, setTab] = useState<Tab>("templates");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [dirty, setDirty] = useState(false);
  const [history, setHistory] = useState<EmailSendHistory[]>([]);
  const [social, setSocial] = useState<SocialLinks | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [t, h, s] = await Promise.all([
          fetchEmailTemplates(),
          fetchEmailHistory(),
          fetchEmailSocialLinks(),
        ]);
        setTemplates(t);
        setHistory(h);
        setSocial(s);
      } catch (e) {
        setFlash({ kind: "err", msg: e instanceof Error ? e.message : "Failed to load data" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!flash) return;
    // Only auto-dismiss success messages. Errors stay until the user dismisses them.
    if (flash.kind === "err") return;
    const id = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(id);
  }, [flash]);

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) || null,
    [templates, selectedId],
  );

  function pickTemplate(id: string) {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setSelectedId(id);
    setDraft({
      id: t.id,
      name: t.name,
      category: t.category,
      language: t.language,
      subject: t.subject,
      body: t.body,
      ctaText: t.ctaText,
      ctaLink: t.ctaLink,
      headerImageUrl: t.headerImageUrl,
      footerContact: t.footerContact,
      signature: t.signature ?? "",
    });
    setDirty(false);
  }

  function startNew() {
    setSelectedId(null);
    setDraft(emptyDraft());
    setDirty(true);
  }

  function duplicateCurrent() {
    if (!draft) return;
    setDraft({ ...draft, id: undefined, name: `${draft.name} (Copy)` });
    setSelectedId(null);
    setDirty(true);
  }

  async function save() {
    if (!draft) return;
    setBusy(true);
    try {
      if (draft.id) {
        const updated = await updateEmailTemplate({
          ...draft,
          id: draft.id,
          createdAt: selected?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setSelectedId(updated.id);
        setFlash({ kind: "ok", msg: "Template saved" });
      } else {
        const created = await createEmailTemplate({
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
        });
        setTemplates((prev) => [created, ...prev]);
        setSelectedId(created.id);
        setDraft({ ...draft, id: created.id });
        setFlash({ kind: "ok", msg: "Template created" });
      }
      setDirty(false);
    } catch (e) {
      setFlash({ kind: "err", msg: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!draft?.id) return;
    if (!confirm(`Delete "${draft.name}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteEmailTemplate(draft.id);
      setTemplates((prev) => prev.filter((t) => t.id !== draft.id));
      setSelectedId(null);
      setDraft(null);
      setDirty(false);
      setFlash({ kind: "ok", msg: "Template deleted" });
    } catch (e) {
      setFlash({ kind: "err", msg: e instanceof Error ? e.message : "Delete failed" });
    } finally {
      setBusy(false);
    }
  }

  async function handleSend(
    mode: "send" | "test",
    recipients: { to: string; cc: string[]; bcc: string[] },
    variables: Record<string, string>,
  ) {
    if (!draft) return;
    setBusy(true);
    try {
      await sendEmail({
        templateId: draft.id ?? null,
        inline: draft.id
          ? undefined
          : {
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
        to: recipients.to,
        cc: recipients.cc,
        bcc: recipients.bcc,
        mode,
        language: draft.language,
        variables,
      });
      const h = await fetchEmailHistory();
      setHistory(h);
      setFlash({ kind: "ok", msg: mode === "test" ? "Test email sent" : "Email sent successfully" });
    } catch (e) {
      setFlash({ kind: "err", msg: e instanceof Error ? e.message : "Send failed" });
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveSocial(next: SocialLinks) {
    setBusy(true);
    try {
      const updated = await updateEmailSocialLinks(next);
      setSocial(updated);
      setFlash({ kind: "ok", msg: "Social links updated" });
    } catch (e) {
      setFlash({ kind: "err", msg: e instanceof Error ? e.message : "Update failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <header className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A]">Email Templates</h1>
          <p className="mt-2 text-sm text-gray-600 max-w-3xl">
            Create, edit, preview and send professional outreach emails. Every email automatically
            includes the official social footer and is BCC&apos;d to{" "}
            <span className="font-mono text-xs bg-white border border-gray-200 px-1.5 py-0.5 rounded">{MANDATORY_BCC}</span>{" "}
            for audit and archiving.
          </p>
        </header>

        <nav className="flex gap-1 mb-6 border-b border-gray-200">
          {([
            ["templates", "Templates"],
            ["history", "Send history"],
            ["social", "Social footer"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
                tab === k
                  ? "border-[#E98C0B] text-[#1A1A1A]"
                  : "border-transparent text-gray-500 hover:text-[#1A1A1A]"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {flash && (
          <div
            role={flash.kind === "err" ? "alert" : "status"}
            className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium border flex items-start gap-3 ${
              flash.kind === "ok"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-300 text-red-800 shadow-sm"
            }`}
          >
            <span className="flex-1 whitespace-pre-wrap break-words">
              {flash.kind === "err" ? "⚠ " : ""}{flash.msg}
            </span>
            <button
              type="button"
              onClick={() => setFlash(null)}
              aria-label="Dismiss"
              className={`shrink-0 -mr-1 px-2 py-0.5 rounded text-xs font-bold ${
                flash.kind === "ok"
                  ? "text-emerald-700 hover:bg-emerald-100"
                  : "text-red-700 hover:bg-red-100"
              }`}
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : tab === "templates" ? (
          <div className="space-y-5">
            {/* Templates rail — inline "+ New" + horizontal scroll of templates */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-stretch gap-3">
                <button
                  onClick={startNew}
                  className="shrink-0 inline-flex items-center gap-2 bg-[#8C1A1A] hover:bg-[#6b1414] text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition shadow-sm"
                >
                  <span className="text-lg leading-none">＋</span>
                  <span>New template</span>
                </button>
                <div className="h-auto w-px bg-gray-200 shrink-0" />
                {templates.length === 0 ? (
                  <div className="flex-1 flex items-center text-xs text-gray-500 px-2">
                    No templates yet — click <span className="font-semibold mx-1">＋ New template</span> to create your first one.
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 [scrollbar-width:thin]">
                      {templates.map((t) => {
                        const active = selectedId === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => pickTemplate(t.id)}
                            className={`shrink-0 text-left px-3 py-2 rounded-lg border transition min-w-[180px] max-w-[240px] ${
                              active
                                ? "bg-[#fff4e3] border-[#E98C0B]/50 shadow-sm"
                                : "bg-white border-gray-200 hover:border-[#E98C0B]/40 hover:bg-[#fffaf2]"
                            }`}
                          >
                            <div className={`text-sm font-semibold truncate ${active ? "text-[#1A1A1A]" : "text-[#1A1A1A]"}`}>
                              {t.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-[#8C1A1A] truncate">
                                {t.category}
                              </span>
                              <span className="text-[9px] uppercase tracking-wider font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                {t.language}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <section>
              {draft ? (
                <EmailTemplateWorkbench
                  draft={draft}
                  onDraftChange={(d) => {
                    setDraft(d);
                    setDirty(true);
                  }}
                  applyCategoryFully={(cat: ContactCategory, lang: Language) => {
                    const defaults = CATEGORY_TEMPLATES[cat][lang];
                    setDraft({
                      ...(draft as Draft),
                      category: cat,
                      language: lang,
                      subject: defaults.subject,
                      body: defaults.body,
                      ctaText: defaults.ctaText,
                      ctaLink: defaults.ctaLink,
                    });
                    setDirty(true);
                  }}
                  dirty={dirty}
                  busy={busy}
                  isExisting={Boolean(draft.id)}
                  onSave={save}
                  onDuplicate={duplicateCurrent}
                  onDelete={remove}
                  onSend={handleSend}
                  categories={CONTACT_CATEGORIES}
                />
              ) : (
                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                  <p className="text-gray-500 text-sm mb-4">
                    Select a template on the left or create a new one to get started.
                  </p>
                  <button
                    onClick={startNew}
                    className="inline-flex items-center gap-2 bg-[#E98C0B] hover:bg-[#c77409] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition"
                  >
                    Create new template
                  </button>
                </div>
              )}
            </section>
          </div>
        ) : tab === "history" ? (
          <EmailHistoryTable history={history} />
        ) : (
          social && <SocialLinksEditor value={social} onSave={handleSaveSocial} busy={busy} />
        )}
      </div>
    </div>
  );
}
