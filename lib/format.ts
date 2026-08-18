const WOCHENTAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const KURZ_TAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const MONATE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

/** Datum als ISO-Tag (YYYY-MM-DD) in lokaler Zeit, ohne UTC-Verschiebung. */
export function isoTag(datum: Date): string {
  const jahr = datum.getFullYear();
  const monat = String(datum.getMonth() + 1).padStart(2, "0");
  const tag = String(datum.getDate()).padStart(2, "0");
  return `${jahr}-${monat}-${tag}`;
}

export function heuteIso(): string {
  return isoTag(new Date());
}

export function langesDatum(datum: Date): string {
  return `${WOCHENTAGE[datum.getDay()]}, ${datum.getDate()}. ${MONATE[datum.getMonth()]}`;
}

export function uhrzeit(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function kurzerTagMitZeit(iso: string): string {
  const d = new Date(iso);
  return `${KURZ_TAGE[d.getDay()]} ${uhrzeit(iso)}`;
}

export function datumKurz(isoDatum: string | null): string {
  if (!isoDatum) return "";
  const [jahr, monat, tag] = isoDatum.split("-");
  return `${tag}.${monat}.${jahr}`;
}

/** Ganze Tage zwischen heute und dem Datum. Negativ = überfällig. */
export function tageBis(isoDatum: string): number {
  const [jahr, monat, tag] = isoDatum.split("-").map(Number);
  const ziel = new Date(jahr, monat - 1, tag);
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  return Math.round((ziel.getTime() - heute.getTime()) / 86400000);
}

export function faelligkeitText(isoDatum: string | null): { text: string; ton: "critical" | "warning" | "" } {
  if (!isoDatum) return { text: "", ton: "" };
  const tage = tageBis(isoDatum);
  if (tage < 0) return { text: `${Math.abs(tage)} Tage überfällig`, ton: "critical" };
  if (tage === 0) return { text: "Heute fällig", ton: "critical" };
  if (tage === 1) return { text: "Morgen fällig", ton: "warning" };
  if (tage <= 7) return { text: `In ${tage} Tagen fällig`, ton: "warning" };
  return { text: `Fällig ${datumKurz(isoDatum)}`, ton: "" };
}

export function euro(betrag: number | null): string {
  if (betrag === null || betrag === undefined) return "";
  return betrag.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

/** Wert für <input type="datetime-local"> aus einem ISO-Zeitstempel. */
export function fuerDatetimeInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${isoTag(d)}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
