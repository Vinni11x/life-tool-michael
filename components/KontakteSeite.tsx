"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { datumKurz, heuteIso, tageBis } from "@/lib/format";
import type { Kontakt } from "@/lib/types";
import { Fehler, Hero, Leer, SetupHinweis } from "@/components/ui";

type Entwurf = {
  id: string | null;
  name: string;
  rolle: string;
  telefon: string;
  email: string;
  notiz: string;
  letzter_kontakt: string;
  erinnerung_tage: string;
};

const LEERER_ENTWURF: Entwurf = {
  id: null,
  name: "",
  rolle: "",
  telefon: "",
  email: "",
  notiz: "",
  letzter_kontakt: "",
  erinnerung_tage: "",
};

/** Wie lange ist der letzte Kontakt her, und ist das zu lang? */
export function kontaktStand(kontakt: Kontakt): { text: string; faellig: boolean } {
  if (!kontakt.letzter_kontakt) return { text: "Kein Kontakt vermerkt", faellig: false };
  const herTage = -tageBis(kontakt.letzter_kontakt);
  const grenze = kontakt.erinnerung_tage;
  const text =
    herTage <= 0 ? "Heute Kontakt" : herTage === 1 ? "Gestern Kontakt" : `Vor ${herTage} Tagen`;
  return { text, faellig: grenze !== null && herTage >= grenze };
}

export default function KontakteSeite() {
  const [liste, setListe] = useState<Kontakt[]>([]);
  const [laedt, setLaedt] = useState(true);
  const [entwurf, setEntwurf] = useState<Entwurf | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  const laden = useCallback(async () => {
    if (!supabase) {
      setLaedt(false);
      return;
    }
    const { data, error } = await supabase
      .from("kontakte")
      .select("*")
      .order("letzter_kontakt", { ascending: true, nullsFirst: true })
      .order("name", { ascending: true });

    if (error) setFehler(error.message);
    else setListe((data ?? []) as Kontakt[]);
    setLaedt(false);
  }, []);

  useEffect(() => {
    void laden();
  }, [laden]);

  async function speichern() {
    if (!supabase || !entwurf) return;
    if (!entwurf.name.trim()) {
      setFehler("Bitte einen Namen eintragen.");
      return;
    }
    setFehler(null);

    const tage = entwurf.erinnerung_tage.trim() ? Number(entwurf.erinnerung_tage) : null;
    if (tage !== null && (Number.isNaN(tage) || tage < 1)) {
      setFehler("Die Erinnerung braucht eine Zahl in Tagen.");
      return;
    }

    const werte = {
      name: entwurf.name.trim(),
      rolle: entwurf.rolle.trim() || null,
      telefon: entwurf.telefon.trim() || null,
      email: entwurf.email.trim() || null,
      notiz: entwurf.notiz.trim() || null,
      letzter_kontakt: entwurf.letzter_kontakt || null,
      erinnerung_tage: tage,
    };

    const { error } = entwurf.id
      ? await supabase.from("kontakte").update(werte).eq("id", entwurf.id)
      : await supabase.from("kontakte").insert(werte);

    if (error) {
      setFehler(error.message);
      return;
    }
    setEntwurf(null);
    await laden();
  }

  async function heuteKontaktiert(kontakt: Kontakt) {
    if (!supabase) return;
    const { error } = await supabase
      .from("kontakte")
      .update({ letzter_kontakt: heuteIso() })
      .eq("id", kontakt.id);
    if (error) setFehler(error.message);
    else await laden();
  }

  async function loeschen(kontakt: Kontakt) {
    if (!supabase) return;
    if (!window.confirm(`"${kontakt.name}" wirklich löschen?`)) return;
    const { error } = await supabase.from("kontakte").delete().eq("id", kontakt.id);
    if (error) setFehler(error.message);
    else await laden();
  }

  return (
    <>
      <Hero eyebrow="Wichtige Kontakte im Blick behalten" titel="Netzwerk & Kontakte" />
      <SetupHinweis />

      <div className="toolbar">
        <div className="section-label">Kontakte</div>
        <button type="button" className="btn brand" onClick={() => setEntwurf({ ...LEERER_ENTWURF })}>
          + Neuer Kontakt
        </button>
      </div>

      {entwurf ? (
        <div className="formcard">
          <div className="formgrid">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={entwurf.name}
                onChange={(e) => setEntwurf({ ...entwurf, name: e.target.value })}
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="rolle">Rolle</label>
              <input
                id="rolle"
                value={entwurf.rolle}
                onChange={(e) => setEntwurf({ ...entwurf, rolle: e.target.value })}
                placeholder="Investorin, Partner, Lieferant"
              />
            </div>
            <div className="field">
              <label htmlFor="telefon">Telefon</label>
              <input
                id="telefon"
                value={entwurf.telefon}
                onChange={(e) => setEntwurf({ ...entwurf, telefon: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="email">E-Mail</label>
              <input
                id="email"
                value={entwurf.email}
                onChange={(e) => setEntwurf({ ...entwurf, email: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="letzter">Letzter Kontakt</label>
              <input
                id="letzter"
                type="date"
                value={entwurf.letzter_kontakt}
                onChange={(e) => setEntwurf({ ...entwurf, letzter_kontakt: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="erinnerung">Erinnern nach ... Tagen</label>
              <input
                id="erinnerung"
                inputMode="numeric"
                value={entwurf.erinnerung_tage}
                onChange={(e) => setEntwurf({ ...entwurf, erinnerung_tage: e.target.value })}
                placeholder="21"
              />
              <span className="hint">Leer lassen, wenn keine Erinnerung nötig ist.</span>
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

      <div className="simple-list">
        {laedt ? (
          <Leer text="Wird geladen ..." />
        ) : liste.length === 0 ? (
          <Leer text="Noch keine Kontakte hinterlegt." />
        ) : (
          liste.map((kontakt) => {
            const stand = kontaktStand(kontakt);
            return (
              <div className="srow" key={kontakt.id}>
                <div className="main" style={{ flex: 1 }}>
                  <strong>{kontakt.name}</strong>
                  <span>
                    {[
                      kontakt.rolle,
                      kontakt.letzter_kontakt ? `zuletzt ${datumKurz(kontakt.letzter_kontakt)}` : null,
                      kontakt.notiz,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                <div className="right-group">
                  <span className={`right${stand.faellig ? " warning" : ""}`}>
                    {stand.faellig ? "Nachfassen" : stand.text}
                  </span>
                  <button type="button" className="icon-btn" onClick={() => heuteKontaktiert(kontakt)}>
                    Heute gesprochen
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() =>
                      setEntwurf({
                        id: kontakt.id,
                        name: kontakt.name,
                        rolle: kontakt.rolle ?? "",
                        telefon: kontakt.telefon ?? "",
                        email: kontakt.email ?? "",
                        notiz: kontakt.notiz ?? "",
                        letzter_kontakt: kontakt.letzter_kontakt ?? "",
                        erinnerung_tage:
                          kontakt.erinnerung_tage !== null ? String(kontakt.erinnerung_tage) : "",
                      })
                    }
                  >
                    Bearbeiten
                  </button>
                  <button type="button" className="icon-btn danger" onClick={() => loeschen(kontakt)}>
                    Löschen
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
