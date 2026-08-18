import EintraegeListe from "@/components/EintraegeListe";

export default function Seite() {
  return (
    <EintraegeListe
      bereich="finanzen"
      titel="Finanzen"
      eyebrow="Vermögen, Belege, Rückfragen"
      mitBetrag
      platzhalter="Depotwert FNZ Bank"
      hinweis="Werte werden von Hand gepflegt. Eine automatische Anbindung an Revolut, FNZ oder Bitpanda gibt es bislang nicht."
    />
  );
}
