import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { parseNameFromEmail } from '@/lib/emailName';
import { normalizeTagsInput, parseTags, serializeTags } from '@/lib/newsletterTags';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ParsedRow {
  email: string;
  firstName: string | null;
  lastName: string | null;
  raw: string;
}

/**
 * Parse pasted text into rows. Accepts, per line:
 *   - a bare email:                john@doe.com
 *   - "Name <email>":              John Doe <john@doe.com>
 *   - CSV columns:                 John,Doe,john@doe.com  (order: first,last,email — email required, others optional)
 * Separators between multiple entries on one line: comma, semicolon, whitespace, newline.
 */
function parseBulkInput(raw: string): ParsedRow[] {
  const rows: ParsedRow[] = [];
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    // "Name <email>" form
    const angleMatch = line.match(/^(.*)<\s*([^<>\s]+@[^<>\s]+)\s*>$/);
    if (angleMatch) {
      const name = angleMatch[1].trim().replace(/,$/, '');
      const [firstName, ...rest] = name.split(/\s+/).filter(Boolean);
      rows.push({
        email: angleMatch[2].trim(),
        firstName: firstName || null,
        lastName: rest.length ? rest.join(' ') : null,
        raw: line,
      });
      continue;
    }

    // CSV-ish: split on comma/semicolon/tab
    if (/[,;\t]/.test(line)) {
      const parts = line.split(/[,;\t]/).map((p) => p.trim()).filter((p) => p.length > 0);
      const emailPart = parts.find((p) => EMAIL_REGEX.test(p));
      if (emailPart) {
        const others = parts.filter((p) => p !== emailPart);
        rows.push({
          email: emailPart,
          firstName: others[0] || null,
          lastName: others[1] || null,
          raw: line,
        });
        continue;
      }
    }

    // Fallback: split on whitespace, look for anything email-shaped
    const tokens = line.split(/\s+/).filter(Boolean);
    const emailToken = tokens.find((t) => EMAIL_REGEX.test(t));
    if (emailToken) {
      rows.push({ email: emailToken, firstName: null, lastName: null, raw: line });
    } else {
      rows.push({ email: line, firstName: null, lastName: null, raw: line });
    }
  }
  return rows;
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => ({}));
  const rawText: string = typeof body?.text === 'string' ? body.text : '';
  const tags = normalizeTagsInput(body?.tags);

  if (!rawText.trim()) {
    return NextResponse.json({ error: 'Aucun texte à importer' }, { status: 400 });
  }

  const parsedRows = parseBulkInput(rawText);

  const invalid: string[] = [];
  const seenInPayload = new Set<string>();
  const duplicatesInPayload: string[] = [];
  const candidates: ParsedRow[] = [];

  for (const row of parsedRows) {
    const email = row.email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(email)) {
      invalid.push(row.raw);
      continue;
    }
    if (seenInPayload.has(email)) {
      duplicatesInPayload.push(email);
      continue;
    }
    seenInPayload.add(email);
    candidates.push({ ...row, email });
  }

  const existing = await prisma.newsletterSubscriber.findMany({
    where: { email: { in: Array.from(seenInPayload) } },
    select: { id: true, email: true },
  });
  const existingEmails = new Set(existing.map((e) => e.email));

  const toCreate = candidates.filter((c) => !existingEmails.has(c.email));
  const alreadyPresent = candidates.filter((c) => existingEmails.has(c.email)).map((c) => c.email);

  const created: Array<{ id: string; email: string }> = [];
  for (const row of toCreate) {
    const parsedName = parseNameFromEmail(row.email);
    const firstName = row.firstName || parsedName.firstName;
    const lastName = row.lastName || parsedName.lastName;
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || null;
    try {
      const sub = await prisma.newsletterSubscriber.create({
        data: {
          email: row.email,
          firstName,
          lastName,
          name: fullName,
          source: 'admin_bulk_import',
          consent: true,
          status: 'active',
          unsubscribeToken: randomUUID(),
          tags: serializeTags(tags) ?? 'levelup_event',
        },
      });
      created.push({ id: sub.id, email: sub.email });
    } catch {
      // Unique constraint race (e.g. two identical rows created concurrently) — treat as already-present.
      alreadyPresent.push(row.email);
    }
  }

  // Include existing subscriber ids in the response so the caller can
  // auto-select them alongside the newly created ones.
  const existingIds = existing.map((e) => ({ id: e.id, email: e.email }));

  return NextResponse.json({
    created,
    alreadyPresent: Array.from(new Set(alreadyPresent)),
    duplicatesInPayload: Array.from(new Set(duplicatesInPayload)),
    invalid,
    matchedExisting: existingIds,
    tags: parseTags(serializeTags(tags)),
  });
}
