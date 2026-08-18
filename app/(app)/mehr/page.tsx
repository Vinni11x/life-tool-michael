import Link from "next/link";
import { BEREICHE } from "@/lib/bereiche";
import { Hero } from "@/components/ui";

export default function Seite() {
  return (
    <>
      <Hero eyebrow="Seltener gebraucht, aber alles an einem Ort" titel="Mehr" />
      <div className="chip-grid">
        <Link href="/mehr/netzwerk" className="chip">
          <span className="ico">◈</span>
          <span>
            <strong>Netzwerk & Kontakte</strong>
            <span>Wichtige Kontakte, Nachfassen</span>
          </span>
        </Link>
        {BEREICHE.map((bereich) => (
          <Link key={bereich.schluessel} href={`/mehr/${bereich.schluessel}`} className="chip">
            <span className="ico">{bereich.ico}</span>
            <span>
              <strong>{bereich.titel}</strong>
              <span>{bereich.beschreibung}</span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
