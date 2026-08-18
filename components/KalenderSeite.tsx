"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fuerDatetimeInput, isoTag, langesDatum, uhrzeit } from "@/lib/format";
import type { Termin } from "@/lib/types";
import { Fehler, Hero, Leer, SetupHinweis } from "@/components/ui";

type Entwurf = {
  id: string | null;
  titel: string;
  beginn: string;
  ende: string;
  ort: string;
  notiz: string;
  geschuetzt: boolean;
};

function leererEntwurf(): Entwurf {
  const start = new Date();
  start.setHours(start.getHours() + 1, 0, 0, 0);
  return {
    id: null,
    titel: "",
    beginn: fuerDatetimeInput(start.toISOString()),
    ende: "",
    ort: "",
    notiz: "",
    geschuetzt: false,
  };
}

export default function KalenderSeite() {
  const [liste, setListe] = useState<Termin[]>([]);
  const [laedt, setLaedt] = useState(true);
  const [entwurf, setEntwurf] = useState<Entwurf | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  const laden = useCallback(async () => {
    if (!supabase) {
      setLaedt(false);
      return;
    }
    const abGestern = new Date();
    abGestern.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("termine")
      .select("*")
      .gte("beginn", abGestern.toISOString())
      .order("beginn", { ascending: true });

    if (error) setFehler(error.message);
    else setListe((data ?? []) as Termin[]);
    setLaedt(false);
  }, []);

  useEffect(() => {
    void laden();
  }, [laden]);

  async function speichern() {
    if (!supabase || !entwurf) return;
    if (!entwurf.titel.trim() || !entwurf.beginn) {
      setFehler("Bitte Titel und Beginn eintragen.");
      return;
    }
    setFehler(null);

    const werte = {
      titel: entwurf.titel.trim(),
      beginn: new Date(entwurf.beginn).toISOString(),
      ende: entwurf.ende ? new Date(entwurf.ende).toISOString() : null,
      ort: entwurf.ort.trim() || null,
      notiz: entwurf.notiz.trim() || null,
      geschuetzt: entwurf.geschuetzt,
    };

    const { error } = entwurf.id
      ? await supabase.from("termine").update(werte).eq("id", entwurf.id)
      : await supabase.from("termine").insert(werte);

    if (error) {
      setFehler(error.message);
      return;
    }
    setEntwurf(null);
    await laden();
  }

  async function loeschen(termin: Termin) {
    if (!supabase) return;
    if (!window.confirm(`"${termin.titel}" wirklich löschen?`)) return;
    const { error } = await supabase.from("termine").delete().eq("id", termin.id);
    if (error) setFehler(error.message);
    else await laden();
  }

  // Termine nach Tag gruppieren, damit die Woche auf einen Blick lesbar bleibt.
  const tage = liste.reduce<Record<string, Termin[]>>((sammlung, termin) => {
    const tag = isoTag(new Date(termin.beginn));
    (sammlung[tag] ??= []).push(termin);
    return sammlung;
  }, {});

  return (
    <>
      <Hero
        eyebrow="Alle Termine an einem Ort"
        titel="Kalender"
        badge={liste.length ? `${liste.length} anstehend` : undefined}
      />
      <SetupHinweis />

      <div className="toolbar">
        <div className="section-label">Anstehend</div>
        <button type="button" className="btn brand" onClick={() => setEntwurf(leererEntwurf())}>
          + Neuer Termin
        </button>
      </div>

      {entwurf ? (
        <div className="formcard">
          <div className="formgrid">
            <div className="field wide">
              <label htmlFor="titel">Termin</label>
              <input
                id="titel"
                value={entwurf.titel}
                onChange={(e) => setEntwurf({ ...entwurf, titel: e.target.value })}
                placeholder="Abstimmung Studioleitung Nord"
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="beginn">Beginn</label>
              <input
                id="beginn"
                type="datetime-local"
                value={entwurf.beginn}
                onChange={(e) => setEntwurf({ ...entwurf, beginn: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="ende">Ende</label>
              <input
                id="ende"
                type="datetime-local"
                value={entwurf.ende}
                onChange={(e) => setEntwurf({ ...entwurf, ende: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="ort">Ort</label>
              <input
                id="ort"
                value={entwurf.ort}
                onChange={(e) => setEntwurf({ ...entwurf, ort: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="geschuetzt">Art</label>
              <select
                id="geschuetzt"
                value={entwurf.geschuetzt ? "ja" : "nein"}
                onChange={(e) => setEntwurf({ ...entwurf, geschuetzt: e.target.value === "ja" })}
              >
                <option value="nein">Normaler Termin</option>
                <option value="ja">Geschützt, z.B. Pause</option>
              </select>
            </div>
            <div className="field wide">
              <label htmlFor="notiz">Notiz</label>
              <textarea
                id="notiz"
                value={entwurf.notiz}
                onChange={(e) => setEntwurf({ ...entwurf, notiz: e.target.value })}
              />
            </div>
          </div>
          <div className="formactions">
            <button type="button" className="btn" onClick={speichern}>
              Speichern
            </button>
            <button type="button" className="btn ghost" onClick={() => setEntwurf(null)}>
              Abbrechen
            </button>
          </div>
          <Fehler text={fehler} />
        </div>
      ) : (
        <Fehler text={fehler} />
      )}

      {laedt ? (
        <div className="simple-list">
          <Leer text="Wird geladen ..." />
        </div>
      ) : liste.length === 0 ? (
        <div className="simple-list">
          <Leer text="Keine Termine eingetragen." />
        </div>
      ) : (
        Object.entries(tage).map(([tag, termine]) => (
          <div key={tag}>
            <div className="section-label" style={{ marginTop: 22 }}>
              {langesDatum(new Date(`${tag}T12:00:00`))}
            </div>
            <div className="timeline">
              {termine.map((termin) => (
                <div className={`trow${termin.geschuetzt ? " protected" : ""}`} key={termin.id}>
                  <span className="t">
                    {uhrzeit(termin.beginn)}
                    {termin.ende ? `–${uhrzeit(termin.ende)}` : ""}
                  </span>
                  <span className="l">
                    {termin.titel}
                    {termin.ort || termin.notiz ? (
                      <small>{[termin.ort, termin.notiz].filter(Boolean).join(" · ")}</small>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() =>
                      setEntwurf({
                        id: termin.id,
                        titel: termin.titel,
                        beginn: fuerDatetimeInput(termin.beginn),
                        ende: fuerDatetimeInput(termin.ende),
                        ort: termin.ort ?? "",
                        notiz: termin.notiz ?? "",
                        geschuetzt: termin.geschuetzt,
                      })
                    }
                  >
                    Bearbeiten
                  </button>
                  <button type="button" className="icon-btn danger" onClick={() => loeschen(termin)}>
                    Löschen
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <div className="note">
        Vergangene Termine werden ausgeblendet. Die Anbindung an Outlook kommt im nächsten Schritt.
      </div>
    </>
  );
}
