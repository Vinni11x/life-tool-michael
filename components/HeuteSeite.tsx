"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { findeBereich } from "@/lib/bereiche";
import { euro, heuteIso, isoTag, langesDatum, tageBis, uhrzeit } from "@/lib/format";
import type { Aufgabe, Eintrag, Kontakt, Termin } from "@/lib/types";
import { kontaktStand } from "@/components/KontakteSeite";
import { Hero, Leer, SetupHinweis } from "@/components/ui";

type Punkt = {
  id: string;
  titel: string;
  hinweis: string;
  quelle: string;
  ton: "critical" | "warning";
  symbol: string;
};

export default function HeuteSeite() {
  const [aufgaben, setAufgaben] = useState<Aufgabe[]>([]);
  const [termine, setTermine] = useState<Termin[]>([]);
  const [eintraege, setEintraege] = useState<Eintrag[]>([]);
  const [kontakte, setKontakte] = useState<Kontakt[]>([]);
  const [laedt, setLaedt] = useState(true);

  const laden = useCallback(async () => {
    if (!supabase) {
      setLaedt(false);
      return;
    }
    const tagStart = new Date();
    tagStart.setHours(0, 0, 0, 0);
    const tagEnde = new Date(tagStart);
    tagEnde.setDate(tagEnde.getDate() + 1);

    const [a, t, e, k] = await Promise.all([
      supabase.from("aufgaben").select("*").eq("erledigt", false),
      supabase
        .from("termine")
        .select("*")
        .gte("beginn", tagStart.toISOString())
        .lt("beginn", tagEnde.toISOString())
        .order("beginn", { ascending: true }),
      supabase.from("eintraege").select("*").eq("erledigt", false),
      supabase.from("kontakte").select("*"),
    ]);

    setAufgaben((a.data ?? []) as Aufgabe[]);
    setTermine((t.data ?? []) as Termin[]);
    setEintraege((e.data ?? []) as Eintrag[]);
    setKontakte((k.data ?? []) as Kontakt[]);
    setLaedt(false);
  }, []);

  useEffect(() => {
    void laden();
  }, [laden]);

  const heute = heuteIso();
  const punkte: Punkt[] = [];

  // Aufgaben: kritisch, überfällig oder heute fällig.
  for (const aufgabe of aufgaben) {
    const ueberfaellig = aufgabe.faellig_am !== null && aufgabe.faellig_am <= heute;
    const kritisch = aufgabe.prioritaet === "kritisch";
    const liegtLange =
      aufgabe.delegiert_an !== null &&
      tageBis(isoTag(new Date(aufgabe.erstellt_am))) <= -3;

    if (!ueberfaellig && !kritisch && !liegtLange) continue;

    punkte.push({
      id: `aufgabe-${aufgabe.id}`,
      titel: aufgabe.titel,
      hinweis: aufgabe.delegiert_an
        ? `An ${aufgabe.delegiert_an} delegiert${liegtLange ? ", liegt länger offen" : ""}`
        : aufgabe.faellig_am === heute
          ? "Eigene Aufgabe, fällig heute"
          : ueberfaellig
            ? "Eigene Aufgabe, überfällig"
            : "Eigene Aufgabe",
      quelle: aufgabe.delegiert_an ? "Team" : "Aufgabe",
      ton: ueberfaellig || kritisch ? "critical" : "warning",
      symbol: aufgabe.delegiert_an ? "☺" : "✓",
    });
  }

  // Einträge aus den Bereichen, die in den nächsten sieben Tagen fällig sind.
  for (const eintrag of eintraege) {
    if (!eintrag.faellig_am) continue;
    const tage = tageBis(eintrag.faellig_am);
    if (tage > 7) continue;
    const bereich = findeBereich(eintrag.bereich);
    punkte.push({
      id: `eintrag-${eintrag.id}`,
      titel: eintrag.titel,
      hinweis:
        [eintrag.detail, eintrag.betrag !== null ? euro(eintrag.betrag) : null]
          .filter(Boolean)
          .join(" · ") || (tage < 0 ? "Überfällig" : "Steht an"),
      quelle: bereich?.titel.split(" ")[0] ?? eintrag.bereich,
      ton: tage <= 0 ? "critical" : "warning",
      symbol: "◆",
    });
  }

  // Kontakte, bei denen die eigene Erinnerungsfrist überschritten ist.
  for (const kontakt of kontakte) {
    const stand = kontaktStand(kontakt);
    if (!stand.faellig) continue;
    punkte.push({
      id: `kontakt-${kontakt.id}`,
      titel: kontakt.name,
      hinweis: `${stand.text} kein Kontakt${kontakt.rolle ? `, ${kontakt.rolle}` : ""}`,
      quelle: "Netzwerk",
      ton: "warning",
      symbol: "◈",
    });
  }

  punkte.sort((a, b) => (a.ton === b.ton ? 0 : a.ton === "critical" ? -1 : 1));

  const kritisch = punkte.filter((p) => p.ton === "critical").length;
  const aufmerksam = punkte.length - kritisch;
  const jetzt = new Date();

  return (
    <>
      <Hero
        eyebrow={`${langesDatum(jetzt)} · ${uhrzeit(jetzt.toISOString())} Uhr`}
        titel="Guten Tag, Michael"
        badge={punkte.length ? `${punkte.length} offene Punkte` : "Nichts Dringendes"}
      />
      <SetupHinweis />

      <div className="stat-strip">
        <div className="stat-pill" style={{ "--accent": "#d03b3b" } as React.CSSProperties}>
          <div className="n">{kritisch}</div>
          <div className="l">Kritisch</div>
        </div>
        <div className="stat-pill" style={{ "--accent": "#c98500" } as React.CSSProperties}>
          <div className="n">{aufmerksam}</div>
          <div className="l">Braucht Aufmerksamkeit</div>
        </div>
        <div className="stat-pill" style={{ "--accent": "#7ED321" } as React.CSSProperties}>
          <div className="n">{termine.length}</div>
          <div className="l">Termine heute</div>
        </div>
      </div>

      <div className="section-label">Wichtig heute</div>
      <div className="priority-list">
        {laedt ? (
          <Leer text="Wird geladen ..." />
        ) : punkte.length === 0 ? (
          <Leer text="Nichts Dringendes offen." />
        ) : (
          punkte.map((punkt) => (
            <div className="prow" key={punkt.id}>
              <span className={`swatch ${punkt.ton}`}>{punkt.symbol}</span>
              <div className="body">
                <strong>{punkt.titel}</strong>
                <span>{punkt.hinweis}</span>
              </div>
              <span className="source">{punkt.quelle}</span>
            </div>
          ))
        )}
      </div>

      <div className="section-label" style={{ marginTop: 28 }}>Termine heute</div>
      <div className="timeline">
        {laedt ? (
          <Leer text="Wird geladen ..." />
        ) : termine.length === 0 ? (
          <Leer text="Heute keine Termine." />
        ) : (
          termine.map((termin) => (
            <div className={`trow${termin.geschuetzt ? " protected" : ""}`} key={termin.id}>
              <span className="t">{uhrzeit(termin.beginn)}</span>
              <span className="l">
                {termin.titel}
                {termin.ort ? <small>{termin.ort}</small> : null}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
