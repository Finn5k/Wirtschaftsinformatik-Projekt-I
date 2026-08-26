-- LocalCourt — Objektkommentare mit korrekten Umlauten
--
-- Die Kommentare der vorangehenden Migrationen waren in ASCII-Ersatzschreibung
-- verfasst (ae/oe/ue/ss) und wichen damit von der Schreibweise der übrigen
-- Projektdokumentation ab. Die Quelldateien sind korrigiert; weil `comment on`
-- den Text tatsächlich in der Datenbank ablegt, wird er hier nachgezogen —
-- sonst würden Repository und Datenbank auseinanderlaufen.
--
-- Rein redaktionell: keine Struktur-, Rechte- oder Verhaltensänderung.

comment on table public.profile is
  'D1.4 profile - technischer Nutzeraccount; user_id = Auth-Kennung aus NB-02.';

comment on table public.sport is
  'D1.4 sport - Katalog der Sportarten (Stammdaten).';

comment on table public.court is
  'D1.4 court - Sportort; created_by wird beim Löschen des Profils geleert, der Court bleibt.';

comment on table public.session is
  'D1.4 session - Sport-Session. status und confirmed_count sind abgeleitet (D1.6), keine Spalten.';

comment on column public.session.pin is
  'D2.4 Pin - vierstellig numerisch, im Klartext gespeichert (bewusstes Sicherheitsniveau).';

comment on table public.organizer is
  'D1.4 organizer - Organisation einer Session (B8, 1:1); trägt keinen Kapazitäts- oder Check-in-Zustand.';

comment on table public.participant is
  'D1.4 participant - Teilnahme; D2.5 kennt bewusst keinen Wert waiting (P1 NG-10).';

comment on table public.sport_preference is
  'D1.4 sport_preference - Auflösung der n:m-Beziehung Profil<->Sportart (B6).';

comment on function public.session_status(timestamptz, integer) is
  'F3 AF-03 - leitet scheduled/active/completed aus Startzeit, Dauer und jetzt ab.';

comment on function public.confirmed_count(uuid) is
  'D1.6 confirmed_count - zählt confirmed und checked_in; gibt nur die Aggregatzahl heraus (N2.2).';

comment on view public.v_session is
  'Lesesicht auf session mit abgeleitetem status und confirmed_count (D1.6). Ohne pin (N2.2).';

comment on function public.create_session is
  'UC-06/UC-10 - legt Court (optional), Session, organizer und Organisator-Teilnahme atomar an (ADR-001).';

comment on function public.join_session(uuid) is
  'F3 AF-01 - Beitritts- und Kapazitätsregel; hält die Kapazitätsinvariante per Zeilensperre.';

comment on function public.check_in(uuid, text) is
  'F3 AF-02 - Check-in-Validierung; ALREADY_CHECKED_IN ist idempotenter Erfolg (200), kein Fehler.';

comment on function public.session_pin(uuid) is
  'N2.2 Spalten-Policy - PIN nur für Organisator und bestätigte Teilnehmer, sonst NULL.';

comment on function public.my_profile() is
  'UC-12 - eigenes Profil inkl. city; fremde Profile zeigen nur die Basisfelder (D1.4 Datenschutz).';
