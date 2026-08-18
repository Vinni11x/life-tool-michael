import Link from "next/link";
import { notFound } from "next/navigation";
import { BEREICHE, findeBereich } from "@/lib/bereiche";
import EintraegeListe from "@/components/EintraegeListe";

export function generateStaticParams() {
  return BEREICHE.map((bereich) => ({ bereich: bereich.schluessel }));
}

export default async function Seite({ params }: { params: Promise<{ bereich: string }> }) {
  const { bereich: schluessel } = await params;
  const bereich = findeBereich(schluessel);
  if (!bereich) notFound();

  return (
    <>
      <Link href="/mehr" className="back-btn">← Mehr</Link>
      <EintraegeListe
        bereich={bereich.schluessel}
        titel={bereich.titel}
        eyebrow={bereich.eyebrow}
        mitBetrag={bereich.mitBetrag}
      />
    </>
  );
}
