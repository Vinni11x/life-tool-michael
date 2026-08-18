export type BereichKonfig = {
  schluessel: string;
  titel: string;
  eyebrow: string;
  beschreibung: string;
  ico: string;
  mitBetrag?: boolean;
};

/** Die Kacheln unter "Mehr". Reihenfolge = Reihenfolge auf der Seite. */
export const BEREICHE: BereichKonfig[] = [
  {
    schluessel: "content",
    titel: "Content & Social Media",
    eyebrow: "Instagram, Content-Kalender",
    beschreibung: "Ideen, Entwürfe und Freigaben",
    ico: "◐",
  },
  {
    schluessel: "familie",
    titel: "Familie & Privates",
    eyebrow: "Geburtstage, Geschenkideen",
    beschreibung: "Termine und Ideen im Privaten",
    ico: "♥",
  },
  {
    schluessel: "haushalt",
    titel: "Haushalt & Abos",
    eyebrow: "Rechnungen, Zahlungsfristen",
    beschreibung: "Laufende Kosten und Fristen",
    ico: "⌂",
    mitBetrag: true,
  },
  {
    schluessel: "reisen",
    titel: "Reisen",
    eyebrow: "Unterlagen, Bonusprogramme",
    beschreibung: "Geplante Reisen und Unterlagen",
    ico: "✈",
  },
  {
    schluessel: "marke",
    titel: "Persönliche Marke",
    eyebrow: "Presseanfragen, Kernbotschaften",
    beschreibung: "Anfragen und Auftritte",
    ico: "★",
  },
  {
    schluessel: "wissen",
    titel: "Wissen & Branche",
    eyebrow: "Branchennews kompakt",
    beschreibung: "Notizen und Fundstücke",
    ico: "◆",
  },
  {
    schluessel: "sicherheit",
    titel: "Sicherheit & Vorsorge",
    eyebrow: "Datenleck-Check, Notfallordner",
    beschreibung: "Zugänge, Ordner, Checks",
    ico: "⛨",
  },
];

export function findeBereich(schluessel: string): BereichKonfig | undefined {
  return BEREICHE.find((b) => b.schluessel === schluessel);
}
