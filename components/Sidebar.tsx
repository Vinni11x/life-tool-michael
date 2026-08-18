"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const HAUPT = [
  { pfad: "/heute", label: "Heute", ico: "☀" },
  { pfad: "/kalender", label: "Kalender", ico: "▦" },
  { pfad: "/aufgaben", label: "Aufgaben & Team", ico: "✓" },
  { pfad: "/finanzen", label: "Finanzen", ico: "€" },
  { pfad: "/nachrichten", label: "Nachrichten", ico: "◎" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function abmelden() {
    if (supabase) await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

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
          {eintrag.label}
        </Link>
      ))}

      <div className="navgroup-label">Weitere Bereiche</div>
      <Link
        href="/mehr"
        className={`navitem${pathname.startsWith("/mehr") ? " active" : ""}`}
      >
        <span className="ico">⋯</span>
        Mehr
      </Link>

      <div className="spacer" />
      <button type="button" className="logout" onClick={abmelden}>
        Abmelden
      </button>
    </nav>
  );
}
