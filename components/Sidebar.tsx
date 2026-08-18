"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Abmelden from "@/components/Abmelden";

const HAUPT = [
  { pfad: "/heute", label: "Heute", kurz: "Heute", ico: "☀" },
  { pfad: "/kalender", label: "Kalender", kurz: "Kalender", ico: "▦" },
  { pfad: "/aufgaben", label: "Aufgaben & Team", kurz: "Aufgaben", ico: "✓" },
  { pfad: "/finanzen", label: "Finanzen", kurz: "Finanzen", ico: "€" },
  { pfad: "/nachrichten", label: "Nachrichten", kurz: "Nachrichten", ico: "◎" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="sidebar">
      <div className="wordmark">
        <span className="mark">M</span>
        <span className="name">Michael Mäder</span>
      </div>

      {HAUPT.map((eintrag) => (
        <Link
          key={eintrag.pfad}
          href={eintrag.pfad}
          className={`navitem${pathname === eintrag.pfad ? " active" : ""}`}
        >
          <span className="ico">{eintrag.ico}</span>
          <span className="lang">{eintrag.label}</span>
          <span className="kurz">{eintrag.kurz}</span>
        </Link>
      ))}

      <div className="navgroup-label">Weitere Bereiche</div>
      <Link href="/mehr" className={`navitem${pathname.startsWith("/mehr") ? " active" : ""}`}>
        <span className="ico">⋯</span>
        <span className="lang">Mehr</span>
        <span className="kurz">Mehr</span>
      </Link>

      <div className="spacer" />
      <Abmelden className="logout" />
    </nav>
  );
}
