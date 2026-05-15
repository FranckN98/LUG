"use client";

import React, { useMemo, useState } from "react";
import type { EmailSendHistory } from "@/types/emailTemplate";

interface Props {
  history: EmailSendHistory[];
}

function StatusBadge({ status }: { status: EmailSendHistory["status"] }) {
  const styles: Record<string, string> = {
    sent: "bg-emerald-100 text-emerald-800 border-emerald-200",
    failed: "bg-red-100 text-red-800 border-red-200",
    test: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
      {status}
    </span>
  );
}

export function EmailHistoryTable({ history }: Props) {
  const [filter, setFilter] = useState("");
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return history;
    return history.filter((h) =>
      [h.to, h.subject, h.category, h.status].some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [filter, history]);

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">Send history</h2>
          <p className="text-xs text-gray-500 mt-1">Last 200 emails sent through this admin.</p>
        </div>
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by recipient, subject, category…"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-80 focus:outline-none focus:border-[#E98C0B] focus:ring-2 focus:ring-[#E98C0B]/20"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="p-8 text-center text-sm text-gray-500">
          {history.length === 0 ? "No emails sent yet." : "No matches for your filter."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-3">Sent</th>
                <th className="px-5 py-3">Recipient</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                  <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(h.sentAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-[#1A1A1A]">
                    <div className="font-medium">{h.to}</div>
                    {h.cc.length > 0 && (
                      <div className="text-[11px] text-gray-500">cc: {h.cc.join(", ")}</div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[#1A1A1A] max-w-md truncate" title={h.subject}>
                    {h.subject}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600">{h.category}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={h.status} />
                    {h.errorMessage && (
                      <div className="text-[11px] text-red-600 mt-1 max-w-xs truncate" title={h.errorMessage}>
                        {h.errorMessage}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
