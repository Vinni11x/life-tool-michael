"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { faelligkeitText } from "@/lib/format";
import type { Aufgabe, Prioritaet } from "@/lib/types";
import { Fehler, Hero, Leer, SetupHinweis } from "@/components/ui";

type Entwurf = {
  id: string | null;
  titel: string;
  beschreibung: string;
  faellig_am: string;
  delegiert_an: string;
  prioritaet: Prioritaet;
};

const LEERER_ENTWURF: Entwurf = {
  id: null,
  titel: "",
  beschreibung: "",
  faellig_am: "",
  delegiert_an: "",
  prioritaet: "normal",
};

export default function AufgabenSeite() {
  const [liste, setListe] = useState<Aufgabe[]>([]);
  const [laedt, setLaedt] = useState(true);
  const [entwurf, setEntwurf] = useState<Entwurf | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  const laden = useCallback(async () => {
    if (!supabase) {
      setLaedt(false);
      return;
    }
    const { data, error } = await supabase
      .from("aufgaben")
      .select("*")
      .order("erledigt", { ascending: true })
      .order("faellig_am", { ascending: true, nullsFirst: false })
      .order("erstellt_am", { ascending: false });

    if (error) setFehler(error.message);
    else setListe((data ?? []) as Aufgabe[]);
    setLaedt(false);
  }, []);

  useEffect(() => {
    void laden();
  }, [laden]);

  async function speichern() {
    if (!supabase || !entwurf) return;
    if (!entwurf.titel.trim()) {
      setFehler("Bitte einen Titel eintragen.");
      return;
    }
    setFehler(null);

    const werte = {
      titel: entwurf.titel.trim(),
      beschreibung: entwurf.beschreibung.trim() || null,
      faellig_am: entwurf.faellig_am || null,
      delegiert_an: entwurf.delegiert_an.trim() || null,
      prioritaet: entwurf.prioritaet,
    };

    const { error } = entwurf.id
      ? await supabase.from("aufgaben").update(werte).eq("id", entwurf.id)
      : await supabase.from("aufgaben").insert(werte);

    if (error) {
      setFehler(error.message);
      return;
    }
    setEntwurf(null);
    await laden();
  }

  async function umschalten(aufgabe: Aufgabe) {
    if (!supabase) return;
    const erledigt = !aufgabe.erledigt;
    const { error } = await supabase
      .from("aufgaben")
      .update({ erledigt, erledigt_am: erledigt ? new Date().toISOString() : null })
      .eq("id", aufgabe.id);
    if (error) setFehler(error.message);
    else await laden();
  }

  async function loeschen(aufgabe: Aufgabe) {
    if (!supabase) return;
    if (!window.confirm(`"${aufgabe.titel}" wirklich löschen?`)) return;
    const { error } = await supabase.from("aufgaben").delete().eq("id", aufgabe.id);
    if (error) setFehler(error.message);
    else await laden();
  }

  const offen = liste.filter((a) => !a.erledigt);
  const erledigt = liste.filter((a) => a.erledigt);

  return (
    <>
      <Hero
        eyebrow="Eigene Aufgaben und Delegiertes"
        titel="Aufgaben & Team"
        badge={offen.length ? `${offen.length} offen` : undefined}
      />
      <SetupHinweis />

      <div className="toolbar">
        <div className="section-label">Offen</div>
        <button
          type="button"
          className="btn brand"
          onClick={() => setEntwurf({ ...LEERER_ENTWURF })}
        >
          + Neue Aufgabe
        </button>
      </div>

      {entwurf ? (
        <div className="formcard">
          <div className="formgrid">
            <div className="field wide">
              <label htmlFor="titel">Aufgabe</label>
              <input
                id="titel"
                value={entwurf.titel}
                onChange={(e) => setEntwurf({ ...entwurf, titel: e.target.value })}
                placeholder="Vertrag Studio Wertheim gegenlesen"
                autoFocus
              />
            </div>
            <div className="field wide">
              <label htmlFor="beschreibung">Notiz</label>
              <textarea
                id="beschreibung"
                value={entwurf.beschreibung}
                onChange={(e) => setEntwurf({ ...entwurf, beschreibung: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="faellig">Fällig am</label>
              <input
                id="faellig"
                type="date"
                value={entwurf.faellig_am}
                onChange={(e) => setEntwurf({ ...entwurf, faellig_am: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="prioritaet">Priorität</label>
              <select
                id="prioritaet"
                value={entwurf.prioritaet}
                onChange={(e) =>
                  setEntwurf({ ...entwurf, prioritaet: e.target.value as Prioritaet })
                }
              >
                <option value="kritisch">Kritisch</option>
                <option value="wichtig">Wichtig</option>
                <option value="normal">Normal</option>
              </select>
            </div>
            <div className="field wide">
              <label htmlFor="delegiert">Delegiert an</label>
              <input
                id="delegiert"
                value={entwurf.delegiert_an}
                onChange={(e) => setEntwurf({ ...entwurf, delegiert_an: e.target.value })}
                placeholder="Leer lassen für eigene Aufgabe"
              />
              <span className="hint">
                Delegierte Aufgaben werden auf der Startseite erinnert, wenn sie liegen bleiben.
              </span>
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

      <div className="simple-list">
        {laedt ? (
          <Leer text="Wird geladen ..." />
        ) : offen.length === 0 ? (
          <Leer text="Nichts offen. Angenehm." />
        ) : (
          offen.map((aufgabe) => {
            const faellig = faelligkeitText(aufgabe.faellig_am);
            return (
              <div className="srow" key={aufgabe.id}>
                <button
                  type="button"
                  className="check"
                  onClick={() => umschalten(aufgabe)}
                  aria-label="Als erledigt markieren"
                >
                  ✓
                </button>
                <div className="main" style={{ flex: 1 }}>
                  <strong>{aufgabe.titel}</strong>
                  <span>
                    {aufgabe.delegiert_an ? `Delegiert an ${aufgabe.delegiert_an}` : "Eigene Aufgabe"}
                    {aufgabe.beschreibung ? ` · ${aufgabe.beschreibung}` : ""}
                  </span>
                </div>
                <div className="right-group">
                  {aufgabe.prioritaet === "kritisch" ? (
                    <span className="right critical">Kritisch</span>
                  ) : null}
                  {faellig.text ? (
                    <span className={`right ${faellig.ton}`}>{faellig.text}</span>
                  ) : null}
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() =>
                      setEntwurf({
                        id: aufgabe.id,
                        titel: aufgabe.titel,
                        beschreibung: aufgabe.beschreibung ?? "",
                        faellig_am: aufgabe.faellig_am ?? "",
                        delegiert_an: aufgabe.delegiert_an ?? "",
                        prioritaet: aufgabe.prioritaet,
                      })
                    }
                  >
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    className="icon-btn danger"
                    onClick={() => loeschen(aufgabe)}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {erledigt.length > 0 ? (
        <>
          <div className="section-label" style={{ marginTop: 28 }}>Erledigt</div>
          <div className="simple-list">
            {erledigt.slice(0, 20).map((aufgabe) => (
              <div className="srow" key={aufgabe.id}>
                <button
                  type="button"
                  className="check on"
                  onClick={() => umschalten(aufgabe)}
                  aria-label="Wieder öffnen"
                >
                  ✓
                </button>
                <div className="main" style={{ flex: 1 }}>
                  <strong className="done">{aufgabe.titel}</strong>
                  <span>
                    {aufgabe.delegiert_an ? `Delegiert an ${aufgabe.delegiert_an}` : "Eigene Aufgabe"}
                  </span>
                </div>
                <div className="right-group">
                  <button
                    type="button"
                    className="icon-btn danger"
                    onClick={() => loeschen(aufgabe)}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}
