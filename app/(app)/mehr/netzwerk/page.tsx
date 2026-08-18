import Link from "next/link";
import KontakteSeite from "@/components/KontakteSeite";

export default function Seite() {
  return (
    <>
      <Link href="/mehr" className="back-btn">← Mehr</Link>
      <KontakteSeite />
    </>
  );
}
