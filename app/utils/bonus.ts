import { BonusMeta, InvoiceItem } from "../types";

/**
 * Compute which installment (1..N) of a quarterly bonus falls on `invoiceDate`.
 * Payouts start the month AFTER the quarter ends:
 *   Q1 (Jan-Mar) -> Apr,May,Jun
 *   Q2 (Apr-Jun) -> Jul,Aug,Sep
 *   Q3 (Jul-Sep) -> Oct,Nov,Dec
 *   Q4 (Oct-Dec) -> Jan,Feb,Mar (next year)
 *
 * If the invoice month falls outside the payout window the installment is
 * clamped and `outsideWindow` is set to true so the UI can flag it.
 */
export function computeBonusInstallment(
  invoiceDate: Date,
  quarter: number,
  months: number,
): { installment: number; outsideWindow: boolean } {
  const firstPayoutMonth = (quarter * 3) % 12; // 0-11
  let offset = invoiceDate.getMonth() - firstPayoutMonth;
  if (offset < 0) offset += 12;
  const raw = offset + 1;
  const safeMonths = Math.max(months, 1);
  const clamped = Math.min(Math.max(raw, 1), safeMonths);
  return { installment: clamped, outsideWindow: raw !== clamped };
}

/**
 * Build the display description for a bonus item using its stored metadata
 * and the current invoice date, e.g.
 *   "Q2 Team Bonus Payout Engineering 1/3 - July"
 */
export function describeBonus(
  meta: BonusMeta,
  invoiceDate: Date,
): { description: string; outsideWindow: boolean } {
  const { installment, outsideWindow } = computeBonusInstallment(
    invoiceDate,
    meta.quarter,
    meta.months,
  );
  const monthName = new Date(invoiceDate).toLocaleString("default", {
    month: "long",
  });
  const description = `Q${meta.quarter} Team Bonus Payout ${meta.team} ${installment}/${meta.months} - ${monthName}`;
  return { description, outsideWindow };
}

/**
 * Resolve the description to render for an invoice item.
 * - Modern bonus items (with bonusMeta) are computed dynamically from the
 *   invoice date so switching months auto-updates the installment & month,
 *   matching the "worry-free" invoicing ethos.
 * - Legacy bonus items (pre-metadata) fall back to their stored description.
 * - Everything else uses its stored description as-is.
 */
export function resolveItemDescription(
  item: InvoiceItem,
  invoiceDate: Date,
): { description: string; outsideWindow: boolean } {
  if (item.isBonusPayout && item.bonusMeta) {
    return describeBonus(item.bonusMeta, invoiceDate);
  }
  return { description: item.description, outsideWindow: false };
}

/**
 * Reverse the bonus description format string back into BonusMeta so items
 * saved before we introduced structured metadata can be auto-migrated on
 * load without any user action.
 *
 * Matches e.g. "Q2 Team Bonus Payout Engineering 1/3 - July".
 * The team is captured non-greedily so multi-word teams ("Data Platform")
 * still work. The month is discarded — it's re-derived from the invoice date.
 */
const BONUS_DESCRIPTION_REGEX =
  /^Q([1-4]) Team Bonus Payout (.+?) (\d+)\/(\d+) - .+$/;

export function tryParseBonusMeta(description: string): BonusMeta | null {
  const m = description.match(BONUS_DESCRIPTION_REGEX);
  if (!m) return null;
  const quarter = Number(m[1]);
  const team = m[2].trim();
  const months = Number(m[4]);
  if (!team || !Number.isFinite(months) || months < 1) return null;
  return { quarter, team, months };
}
