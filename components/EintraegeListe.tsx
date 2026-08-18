"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { euro, faelligkeitText } from "@/lib/format";
import type { Eintrag, EintragStatus } from "@/lib/types";
import { Fehler, Hero, Leer, SetupHinweis } from "@/components/ui";

type Entwurf = {
  id: string | null;
  titel: string;
  detail: string;
  status: EintragStatus;
  faellig_am: string;
  betrag: string;
};

const LEERER_ENTWURF: Entwurf = {
  id: null,
  titel: "",
  detail: "",
  status: "offen",
  faellig_am: "",
  betrag: "",
};

const STATUS_TEXT: Record<EintragStatus, string> = {
  offen: "Offen",
  wartet: "Wartet",
  erledigt: "Erledigt",
};

export default function EintraegeListe({
  bereich,
  titel,
  eyebrow,
  mitBetrag = false,
  hinweis,
  platzhalter,
}: {
  bereich: string;
  titel: string;
  eyebrow: string;
  mitBetrag?: boolean;
  hinweis?: string;
  platzhalter?: string;
}) {
  const [liste, setListe] = useState<Eintrag[]>([]);
  const [laedt, setLaedt] = useState(true);
  const [entwurf, setEntwurf] = useState<Entwurf | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  const laden = useCallback(async () => {
    if (!supabase) {
      setLaedt(false);
      return;
    }
    const { data, error } = await supabase
      .from("eintraege")
      .select("*")
      .eq("bereich", bereich)
      .order("erledigt", { ascending: true })
      .order("faellig_am", { ascending: true, nullsFirst: false })
      .order("erstellt_am", { ascending: false });

    if (error) setFehler(error.message);
    else setListe((data ?? []) as Eintrag[]);
    setLaedt(false);
  }, [bereich]);

  useEffect(() => {
    setLaedt(true);
    void laden();
  }, [laden]);

  async function speichern() {
    if (!supabase || !entwurf) return;
    if (!entwurf.titel.trim()) {
      setFehler("Bitte einen Titel eintragen.");
      return;
    }
    setFehler(null);

    const betragZahl = entwurf.betrag.trim()
      ? Number(entwurf.betrag.replace(",", "."))
      : null;
    if (betragZahl !== null && Number.isNaN(betragZahl)) {
      setFehler("Der Betrag ist keine gültige Zahl.");
      return;
    }

    const werte = {
      bereich,
      titel: entwurf.titel.trim(),
      detail: entwurf.detail.trim() || null,
      status: entwurf.status,
      faellig_am: entwurf.faellig_am || null,
      betrag: betragZahl,
      erledigt: entwurf.status === "erledigt",
    };

    const { error } = entwurf.id
      ? await supabase.from("eintraege").update(werte).eq("id", entwurf.id)
      : await supabase.from("eintraege").insert(werte);

    if (error) {
      setFehler(error.message);
      return;
    }
    setEntwurf(null);
    await laden();
  }

  async function umschalten(eintrag: Eintrag) {
    if (!supabase) return;
    const erledigt = !eintrag.erledigt;
    const { error } = await supabase
      .from("eintraege")
      .update({ erledigt, status: erledigt ? "erledigt" : "offen" })
      .eq("id", eintrag.id);
    if (error) setFehler(error.message);
    else await laden();
  }

  async function loeschen(eintrag: Eintrag) {
    if (!supabase) return;
    if (!window.confirm(`"${eintrag.titel}" wirklich löschen?`)) return;
    const { error } = await supabase.from("eintraege").delete().eq("id", eintrag.id);
    if (error) setFehler(error.message);
    else await laden();
  }

  const offen = liste.filter((e) => !e.erledigt);
  const summe = mitBetrag
    ? offen.reduce((wert, e) => wert + (e.betrag ?? 0), 0)
    : 0;

  return (
    <>
      <Hero
        eyebrow={eyebrow}
        titel={titel}
        badge={mitBetrag && summe > 0 ? `${euro(summe)} offen` : offen.length ? `${offen.length} offen` : undefined}
      />
      <SetupHinweis />

      <div className="toolbar">
        <div className="section-label">Einträge</div>
        <button type="button" className="btn brand" onClick={() => setEntwurf({ ...LEERER_ENTWURF })}>
          + Neuer Eintrag
        </button>
      </div>

      {entwurf ? (
        <div className="formcard">
          <div className="formgrid">
            <div className="field wide">
              <label htmlFor="titel">Titel</label>
              <input
                id="titel"
                value={entwurf.titel}
                onChange={(e) => setEntwurf({ ...entwurf, titel: e.target.value })}
                placeholder={platzhalter}
                autoFocus
              />
            </div>
            <div className="field wide">
              <label htmlFor="detail">Notiz</label>
              <textarea
                id="detail"
                value={entwurf.detail}
                onChange={(e) => setEntwurf({ ...entwurf, detail: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={entwurf.status}
                onChange={(e) => setEntwurf({ ...entwurf, status: e.target.value as EintragStatus })}
              >
                <option value="offen">Offen</option>
                <option value="wartet">Wartet</option>
                <option value="erledigt">Erledigt</option>
              </select>
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
            {mitBetrag ? (
              <div className="field">
                <label htmlFor="betrag">Betrag in Euro</label>
                <input
                  id="betrag"
                  inputMode="decimal"
                  value={entwurf.betrag}
                  onChange={(e) => setEntwurf({ ...entwurf, betrag: e.target.value })}
                  placeholder="1250,00"
                />
              </div>
            ) : null}
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
        ) : liste.length === 0 ? (
          <Leer text="Noch nichts eingetragen." />
        ) : (
          liste.map((eintrag) => {
            const faellig = faelligkeitText(eintrag.faellig_am);
            return (
              <div className="srow" key={eintrag.id}>
                <button
                  type="button"
                  className={`check${eintrag.erledigt ? " on" : ""}`}
                  onClick={() => umschalten(eintrag)}
                  aria-label="Erledigt umschalten"
                >
                  ✓
                </button>
                <div className="main" style={{ flex: 1 }}>
                  <strong className={eintrag.erledigt ? "done" : undefined}>{eintrag.titel}</strong>
                  <span>
                    {[
                      eintrag.detail,
                      mitBetrag && eintrag.betrag !== null ? euro(eintrag.betrag) : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || STATUS_TEXT[eintrag.status]}
                  </span>
                </div>
                <div className="right-group">
                  {!eintrag.erledigt && eintrag.status === "wartet" ? (
                    <span className="right warning">Wartet</span>
                  ) : null}
                  {!eintrag.erledigt && faellig.text ? (
                    <span className={`right ${faellig.ton}`}>{faellig.text}</span>
                  ) : null}
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() =>
                      setEntwurf({
                        id: eintrag.id,
                        titel: eintrag.titel,
                        detail: eintrag.detail ?? "",
                        status: eintrag.status,
                        faellig_am: eintrag.faellig_am ?? "",
                        betrag: eintrag.betrag !== null ? String(eintrag.betrag) : "",
                      })
                    }
                  >
                    Bearbeiten
                  </button>
                  <button type="button" className="icon-btn danger" onClick={() => loeschen(eintrag)}>
                    Löschen
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {hinweis ? <div className="note">{hinweis}</div> : null}
    </>
  );
}
