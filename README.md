# Life Tool, Michael Mäder

Internes Tool für Termine, Aufgaben, Kontakte und alle weiteren Bereiche an einem Ort.
Basis: Next.js 16 mit Supabase, gleiche Bauweise wie das WerkKompass-Tool.

Der ursprüngliche Klick-Prototyp liegt unter `docs/prototyp.html`.

## Einrichten

1. **Supabase-Projekt anlegen** auf supabase.com (eigenes Projekt, nicht das von WerkKompass).
2. **Tabellen anlegen:** im Supabase-Dashboard den SQL Editor öffnen, den Inhalt von
   `supabase/schema.sql` einfügen und ausführen.
3. **Zugangsdaten eintragen:** `.env.local.example` nach `.env.local` kopieren und die beiden
   Werte aus dem Supabase-Dashboard unter *Project Settings, API* eintragen.
4. **Benutzer anlegen:** im Supabase-Dashboard unter *Authentication, Users* einen Benutzer mit
   E-Mail und Passwort anlegen. Nur damit ist eine Anmeldung möglich.
5. **Starten:** `npm install`, danach `npm run dev`. Das Tool läuft auf http://localhost:3200

Ohne Schritt 3 startet die App trotzdem, zeigt aber überall einen Einrichtungshinweis und
speichert nichts.

## Aufbau

| Bereich | Inhalt | Tabelle |
| --- | --- | --- |
| Heute | Sammelt alles Dringende aus den anderen Bereichen | – |
| Kalender | Termine, nach Tagen gruppiert | `termine` |
| Aufgaben & Team | Eigene und delegierte Aufgaben | `aufgaben` |
| Finanzen | Werte und Belege, mit Betrag | `eintraege` (bereich `finanzen`) |
| Nachrichten | Rückrufe und offene Antworten | `eintraege` (bereich `nachrichten`) |
| Mehr, Netzwerk | Kontakte mit Nachfass-Erinnerung | `kontakte` |
| Mehr, übrige Kacheln | Content, Familie, Haushalt, Reisen, Marke, Wissen, Sicherheit | `eintraege` |

Weitere Kacheln unter *Mehr* lassen sich in `lib/bereiche.ts` ergänzen, ohne neue Tabellen.

## Noch offen

- Postfach und Kalender aus Microsoft 365 anbinden (App-Registrierung nötig)
- WhatsApp-Anbindung (Meta Business Zugang)
- Automatische Erkennung von Rechnungen und Buchungen aus Mails
