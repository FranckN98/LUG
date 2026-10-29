import { describe, expect, it } from 'vitest';
import { hasEditionPassed, isTicketSaleOpen, lastHeldEdition, type EditionTiming } from './ticketSaleWindow';

const edition = (over: Partial<EditionTiming> = {}): EditionTiming => ({
  year: 2026,
  status: 'published',
  startsAt: null,
  endsAt: null,
  ...over,
});

const before = new Date('2026-10-01T10:00:00+02:00');
const after = new Date('2026-10-29T10:00:00+01:00');

describe('ticketSaleWindow', () => {
  it('uses the known 2026 end date when the database has no date', () => {
    expect(hasEditionPassed(edition(), before)).toBe(false);
    expect(hasEditionPassed(edition(), after)).toBe(true);
    expect(hasEditionPassed(null, after)).toBe(true);
  });

  it('prefers the dates stored on the event', () => {
    const e = edition({ startsAt: new Date('2027-10-16T08:30:00+02:00'), year: 2027 });
    expect(hasEditionPassed(e, after)).toBe(false);
    expect(hasEditionPassed(edition({ endsAt: new Date('2026-10-20T18:00:00+02:00') }), after)).toBe(true);
  });

  it('treats a finished event as passed whatever its dates', () => {
    expect(hasEditionPassed(edition({ status: 'finished', endsAt: new Date('2099-01-01') }), before)).toBe(true);
  });

  it('opens sales only when ticketing is active and the edition is not over', () => {
    expect(isTicketSaleOpen({ ticketingActive: true, event: edition(), now: before })).toBe(true);
    expect(isTicketSaleOpen({ ticketingActive: false, event: edition(), now: before })).toBe(false);
    expect(isTicketSaleOpen({ ticketingActive: true, event: edition(), now: after })).toBe(false);
  });

  it('keeps sales open for an event without any date nor known end', () => {
    expect(isTicketSaleOpen({ ticketingActive: true, event: edition({ year: 2030 }), now: after })).toBe(true);
  });

  it('picks the last held edition', () => {
    expect(lastHeldEdition(edition(), before)).toBe('2025');
    expect(lastHeldEdition(edition(), after)).toBe('2026');
    expect(lastHeldEdition(edition({ year: 2027 }), after)).toBe('2026');
    expect(lastHeldEdition(edition({ year: 2025 }), after)).toBe('2025');
  });
});
