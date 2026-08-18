import EintraegeListe from "@/components/EintraegeListe";

export default function Seite() {
  return (
    <EintraegeListe
      bereich="nachrichten"
      titel="Nachrichten"
      eyebrow="WhatsApp, Anrufe, Rückrufe"
      platzhalter="Boris, Rückruf zur Studio-Eröffnung"
      hinweis="Noch von Hand gepflegt. Die WhatsApp-Anbindung braucht einen Meta-Business-Zugang."
    />
  );
}
