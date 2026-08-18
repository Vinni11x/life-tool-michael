-- Life Tool, Datenbankschema
-- Internes Tool, ein einziger Nutzer. Jede angemeldete Person darf alles sehen und ändern.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- Aufgaben
create table if not exists aufgaben (
  id           uuid primary key default gen_random_uuid(),
  titel        text not null,
  beschreibung text,
  faellig_am   date,
  delegiert_an text,                                   -- leer = eigene Aufgabe
  prioritaet   text not null default 'normal',         -- kritisch | wichtig | normal
  erledigt     boolean not null default false,
  erledigt_am  timestamptz,
  erstellt_am  timestamptz not null default now()
);

-- ---------------------------------------------------------------- Termine
create table if not exists termine (
  id           uuid primary key default gen_random_uuid(),
  titel        text not null,
  beginn       timestamptz not null,
  ende         timestamptz,
  ort          text,
  notiz        text,
  geschuetzt   boolean not null default false,         -- z.B. Pause, bewusst frei
  erstellt_am  timestamptz not null default now()
);

-- ---------------------------------------------------------------- Kontakte
create table if not exists kontakte (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  rolle           text,
  telefon         text,
  email           text,
  notiz           text,
  letzter_kontakt date,
  erinnerung_tage integer,                             -- nach X Tagen ohne Kontakt erinnern
  erstellt_am     timestamptz not null default now()
);

-- ---------------------------------------------------------------- Einträge
-- Ein Topf für alle Listenbereiche (Finanzen, Nachrichten, Haushalt, Reisen, ...).
create table if not exists eintraege (
  id           uuid primary key default gen_random_uuid(),
  bereich      text not null,                          -- finanzen | nachrichten | content | familie | haushalt | reisen | marke | wissen | sicherheit
  titel        text not null,
  detail       text,
  status       text not null default 'offen',          -- offen | wartet | erledigt
  faellig_am   date,
  betrag       numeric(12,2),
  erledigt     boolean not null default false,
  erstellt_am  timestamptz not null default now()
);

create index if not exists eintraege_bereich_idx on eintraege (bereich);
create index if not exists aufgaben_faellig_idx  on aufgaben (faellig_am);
create index if not exists termine_beginn_idx    on termine (beginn);

-- ---------------------------------------------------------------- Rechte
alter table aufgaben  enable row level security;
alter table termine   enable row level security;
alter table kontakte  enable row level security;
alter table eintraege enable row level security;

drop policy if exists "angemeldet darf alles" on aufgaben;
drop policy if exists "angemeldet darf alles" on termine;
drop policy if exists "angemeldet darf alles" on kontakte;
drop policy if exists "angemeldet darf alles" on eintraege;

create policy "angemeldet darf alles" on aufgaben
  for all to authenticated using (true) with check (true);
create policy "angemeldet darf alles" on termine
  for all to authenticated using (true) with check (true);
create policy "angemeldet darf alles" on kontakte
  for all to authenticated using (true) with check (true);
create policy "angemeldet darf alles" on eintraege
  for all to authenticated using (true) with check (true);
