"use client";

import { isSupabaseConfigured } from "@/lib/supabase";

export function Hero({
  eyebrow,
  titel,
  badge,
}: {
  eyebrow: string;
  titel: string;
  badge?: string;
}) {
  return (
    <div className="hero">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="page-title">{titel}</h1>
      </div>
      {badge ? <span className="badge">{badge}</span> : null}
    </div>
  );
}

export function Leer({ text }: { text: string }) {
  return <div className="empty">{text}</div>;
}

/** Hinweis, solange kein Supabase-Projekt hinterlegt ist. */
export function SetupHinweis() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="banner">
      <strong>Noch nicht mit der Datenbank verbunden</strong>
      Lege eine Datei <code>.env.local</code> mit <code>NEXT_PUBLIC_SUPABASE_URL</code> und{" "}
      <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> an und starte den Server neu. Danach lassen sich
      Einträge speichern.
    </div>
  );
}

export function Fehler({ text }: { text: string | null }) {
  if (!text) return null;
  return <p className="fehler">{text}</p>;
}
