// One-off parser: turns the pasted "campaigns_brief.txt" (10 LU2026 templates,
// paragraphs separated by runs of 2+ spaces instead of real newlines) into a
// structured JSON array, preserving original accented French text exactly.
// Output consumed by scripts/seed-newsletter-templates-2026.mjs.
import fs from 'fs';
import os from 'os';
import path from 'path';

const text = fs.readFileSync(path.join(os.tmpdir(), 'campaigns_brief.txt'), 'utf8');
const segments = text.split(/ {2,}/).map((s) => s.trim()).filter((s) => s.length > 0);

function idx(from, label) {
  for (let i = from; i < segments.length; i++) {
    if (segments[i].startsWith(label)) return i;
  }
  return -1;
}

// Find the start index of each "N. TEMPLATE" block
const templateStarts = [];
segments.forEach((s, i) => {
  if (/^\d+\.\s*TEMPLATE\s*\d+/.test(s)) templateStarts.push(i);
});

const templates = [];
for (let t = 0; t < templateStarts.length; t++) {
  const start = templateStarts[t];
  const end = t + 1 < templateStarts.length ? templateStarts[t + 1] : segments.length;
  const block = segments.slice(start, end);

  const localIdx = (label) => block.findIndex((s) => s.startsWith(label));
  const after = (label) => {
    const i = localIdx(label);
    return i >= 0 && i + 1 < block.length ? block[i + 1] : null;
  };

  const titleLine = block[0]; // "18. TEMPLATE 01 - COUT DE L'INACTION" style (ascii-only line, matches original too since no accents in "TEMPLATE"/numbers)
  const campaignNumber = parseInt(titleLine.match(/TEMPLATE\s*(\d+)/)[1], 10);

  const nomIdx = block.findIndex((s) => s.startsWith('Nom'));
  const nomValue = nomIdx >= 0 ? block[nomIdx + 1] : null; // "LU2026-01 - Le cout de l'inaction"
  const keyMatch = nomValue ? nomValue.match(/^(LU2026-\d+)/) : null;
  const templateKey = keyMatch ? keyMatch[1] : `LU2026-${String(campaignNumber).padStart(2, '0')}`;

  const dateIdx = block.findIndex((s) => s.startsWith('Date'));
  const dateValue = dateIdx >= 0 ? block[dateIdx + 1] : null; // "17.09.2026"

  const audienceIdx = block.findIndex((s) => s.startsWith('Audience'));
  const audienceValue = audienceIdx >= 0 && !/^\d{2}\.\d{2}\.\d{4}/.test(block[audienceIdx + 1] || '')
    ? block[audienceIdx + 1]
    : null;

  const subject = after('Objet');
  const preheader = after('Préheader') || after('Preheader');
  const titleText = after('Headline') || after('Hero text') || null;
  const ctaIdx = block.findIndex((s) => s.startsWith('CTA'));
  const ctaLabel = ctaIdx >= 0 ? block[ctaIdx + 1] : null;
  const ctaUrl = ctaIdx >= 0 ? block[ctaIdx + 2] : null;

  const corpsIdx = block.findIndex((s) => s.startsWith('Corps'));
  const bodyParas = corpsIdx >= 0 ? block.slice(corpsIdx + 1, ctaIdx) : [];

  templates.push({
    campaignNumber,
    templateKey,
    recommendedSendAt: dateValue,
    recommendedAudience: audienceValue,
    subject,
    preheader,
    titleText,
    bodyParagraphs: bodyParas,
    ctaLabel,
    ctaUrl,
  });
}

const outPath = path.join('c:\\Users\\Franck Ngami\\LevelUpSite\\Level-Up-in-Germany', 'tmp', 'lu2026-templates.json');
fs.writeFileSync(outPath, JSON.stringify(templates, null, 2), 'utf8');
console.log('Parsed', templates.length, 'templates ->', outPath);
