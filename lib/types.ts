export type Prioritaet = "kritisch" | "wichtig" | "normal";

export type Aufgabe = {
  id: string;
  titel: string;
  beschreibung: string | null;
  faellig_am: string | null;
  delegiert_an: string | null;
  prioritaet: Prioritaet;
  erledigt: boolean;
  erledigt_am: string | null;
  erstellt_am: string;
};

export type Termin = {
  id: string;
  titel: string;
  beginn: string;
  ende: string | null;
  ort: string | null;
  notiz: string | null;
  geschuetzt: boolean;
  erstellt_am: string;
};

export type Kontakt = {
  id: string;
  name: string;
  rolle: string | null;
  telefon: string | null;
  email: string | null;
  notiz: string | null;
  letzter_kontakt: string | null;
  erinnerung_tage: number | null;
  erstellt_am: string;
};

export type EintragStatus = "offen" | "wartet" | "erledigt";

export type Eintrag = {
  id: string;
  bereich: string;
  titel: string;
  detail: string | null;
  status: EintragStatus;
  faellig_am: string | null;
  betrag: number | null;
  erledigt: boolean;
  erstellt_am: string;
};
