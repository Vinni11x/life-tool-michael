"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function LoginSeite() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function anmelden(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    setLaeuft(true);
    setFehler(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password: passwort });

    if (error) {
      setFehler("E-Mail oder Passwort ist falsch.");
      setLaeuft(false);
      return;
    }

    router.push("/heute");
    router.refresh();
  }

  return (
    <div className="login-plane">
      <div className="login-card">
        <div className="mark">M</div>
        <h1>Life Tool</h1>
        <p className="sub">Bitte anmelden.</p>

        {!isSupabaseConfigured ? (
          <div className="banner">
            <strong>Noch nicht mit der Datenbank verbunden</strong>
            Ohne <code>.env.local</code> ist keine Anmeldung möglich.
          </div>
        ) : null}

        <form onSubmit={anmelden}>
          <div className="field" style={{ marginBottom: 12 }}>
            <label htmlFor="email">E-Mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="field" style={{ marginBottom: 18 }}>
            <label htmlFor="passwort">Passwort</label>
            <input
              id="passwort"
              type="password"
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn brand"
            style={{ width: "100%" }}
            disabled={laeuft || !isSupabaseConfigured}
          >
            {laeuft ? "Einen Moment ..." : "Anmelden"}
          </button>
          {fehler ? <p className="fehler">{fehler}</p> : null}
        </form>
      </div>
    </div>
  );
}
