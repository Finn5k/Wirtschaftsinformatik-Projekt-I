-- LocalCourt — Row-Level-Security und Rechtevergabe
--
-- Setzt die Policy-Tabelle aus N2.2 um. Autorisierung liegt vollständig auf
-- Datenbankebene, weil TECH-03 eine eigene Backend-Schicht ausschließt und der
-- Browser direkt gegen NB-03 spricht (ADR-002, A04 4.3).
--
-- ABWEICHUNG von N2.2, bewusst und dokumentiert:
-- N2.2 formuliert die Leserechte auf session/organizer/court/sport als "lesbar
-- für alle ANGEMELDETEN Nutzer". Das widerspricht drei anderen Bausteinen:
--   - UC-02 Vorbedingung: "Anmeldung ist für die Suche nicht zwingend erforderlich"
--   - B1.2: "Suche und Detailansicht (DLG-02, DLG-03, DLG-04) sind ohne Anmeldung nutzbar"
--   - B1.5.2: geschützt sind nur Beitreten, Erstellen, Check-in, Meine Sessions, Profil
-- Umgesetzt ist die Mehrheitslesart (UC-02/B1): Sessions, Courts und Sportarten
-- sind auch unangemeldet lesbar. Personenbezogene Daten bleiben davon unberührt -
-- profile und participant sind weiterhin nur angemeldet zugänglich (N1-QA-03).
-- Die Formulierung in N2.2 sollte entsprechend nachgezogen werden.

-- --------------------------------------------------------- RLS aktivieren
alter table public.profile          enable row level security;
alter table public.sport            enable row level security;
alter table public.court            enable row level security;
alter table public.session          enable row level security;
alter table public.organizer        enable row level security;
alter table public.participant      enable row level security;
alter table public.sport_preference enable row level security;

-- ------------------------------------------- Standardrechte zurücknehmen
-- Supabase vergibt auf public schema-weite Rechte an anon/authenticated. Für
-- ein belastbares Rechtebild werden sie zurückgenommen und unten gezielt neu
-- erteilt, statt sich auf Voreinstellungen zu verlassen.
revoke all on public.profile,
              public.sport,
              public.court,
              public.session,
              public.organizer,
              public.participant,
              public.sport_preference
  from anon, authenticated;

-- =============================================================== sport
-- N2.2: lesbar für alle. Stammdaten - kein Schreibzugriff für Endnutzer.
grant select on public.sport to anon, authenticated;

create policy sport_select on public.sport
  for select using (true);

-- =============================================================== court
-- N2.2: lesbar für alle; Erstellung durch angemeldete Nutzer mit
-- created_by = auth.uid() (UC-10, S1.4 courtAnlegen).
grant select on public.court to anon, authenticated;
grant insert on public.court to authenticated;

create policy court_select on public.court
  for select using (true);

create policy court_insert on public.court
  for insert to authenticated
  with check (created_by = (select auth.uid()));

-- ============================================================= session
-- N2.2: lesbar; kein Schreibzugriff außer über create_session.
-- Deshalb wird ausschließlich SELECT erteilt - und zwar spaltenweise ohne pin.
-- Das ist die Umsetzung der Spalten-Policy aus N2.2: RLS wirkt zeilenweise und
-- kann eine einzelne Spalte nicht ausblenden, ein Spalten-GRANT schon.
grant select (
  session_id, sport_id, court_id, title, description,
  start_at, duration_min, max_participants, created_at
) on public.session to anon, authenticated;

create policy session_select on public.session
  for select using (true);

-- Der fachliche Lesepfad ist v_session (status und confirmed_count, ohne pin).
-- security_invoker = on sorgt dafür, dass die Policy oben auch hier greift.
revoke all on public.v_session from anon, authenticated;
grant select on public.v_session to anon, authenticated;

-- =========================================================== organizer
-- N2.2: lesbar (Anzeige "Organisator" im Session-Detail, UC-03);
-- kein Schreibzugriff außer über create_session.
grant select on public.organizer to anon, authenticated;

create policy organizer_select on public.organizer
  for select using (true);

-- ========================================================= participant
-- N2.2: lesbar für den Organisator der Session (Teilnehmerliste, UC-07) und
-- für den Nutzer selbst (UC-05, UC-11). Schreibzugriff ausschließlich über
-- join_session/check_in - daher kein INSERT/UPDATE/DELETE-GRANT.
grant select on public.participant to authenticated;

create policy participant_select_self on public.participant
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy participant_select_as_organizer on public.participant
  for select to authenticated
  using (exists (
    select 1
      from public.organizer o
     where o.session_id = participant.session_id
       and o.user_id = (select auth.uid())
  ));

-- ============================================================= profile
-- N2.2 und D1.4 "Datenschutz": Für andere Nutzer sind ausschließlich
-- display_name und avatar_url sichtbar; city dient nur der eigenen
-- Ortsvorbelegung und wird anderen nicht angezeigt.
--
-- RLS wirkt zeilenweise, kann also nicht "eigene Zeile ganz, fremde Zeile
-- teilweise" ausdrücken. Deshalb: die Basistabelle gibt nur die eigene Zeile
-- frei, fremde Basisfelder laufen über v_profile_public.
grant select on public.profile to authenticated;
grant update (display_name, city) on public.profile to authenticated;

create policy profile_select_self on public.profile
  for select to authenticated
  using (user_id = (select auth.uid()));

-- avatar_url bleibt im MVP unverändert (N2.2) und ist deshalb nicht im
-- UPDATE-GRANT enthalten.
create policy profile_update_self on public.profile
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Fremde Profile: nur die Basisfelder aus D1.4 "Datenschutz".
-- security_invoker bleibt aus, weil genau das die Aufgabe dieser View ist -
-- kontrolliert weniger Spalten freizugeben, als die Zeilenpolicy oben zulässt.
create view public.v_profile_public as
select
  p.user_id,
  p.display_name,
  p.avatar_url
from public.profile p;

grant select on public.v_profile_public to authenticated;

comment on view public.v_profile_public is
  'D1.4 Datenschutz - für andere Nutzer sichtbare Profilfelder (display_name, avatar_url).';

-- ==================================================== sport_preference
-- N2.2: nur für den eigenen user_id schreibbar (UC-12,
-- S1.4 sportpraeferenzSetzen/-Entfernen).
grant select, insert, delete on public.sport_preference to authenticated;

create policy sport_preference_select_self on public.sport_preference
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy sport_preference_insert_self on public.sport_preference
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy sport_preference_delete_self on public.sport_preference
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ========================================================== PIN-Zugriff
-- N2.2 Spalten-Policy: die PIN ist nur für den Organisator und für
-- bestätigte Teilnehmer sichtbar. Das SELECT-GRANT auf session enthält die
-- Spalte nicht; dieser gekapselte Zugriff ist der einzige Weg.
--
-- Rückgabe NULL statt Fehler: N2.2 formuliert eine Sichtbarkeitsregel, und
-- N2.2 warnt ausdrücklich davor, eine technische Zugriffsablehnung mit einem
-- fachlichen F3-Ergebniscode zu verwechseln. "Nicht sichtbar" ist deshalb kein
-- Ergebniscode, sondern schlicht kein Wert.
create function public.session_pin(p_session_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $fn$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return null;
  end if;

  if exists (
       select 1 from public.organizer
        where session_id = p_session_id and user_id = v_user_id
     )
     or exists (
       select 1 from public.participant
        where session_id = p_session_id
          and user_id = v_user_id
          and status in ('confirmed', 'checked_in')
     )
  then
    return (select pin from public.session where session_id = p_session_id);
  end if;

  return null;
end;
$fn$;

comment on function public.session_pin(uuid) is
  'N2.2 Spalten-Policy - PIN nur für Organisator und bestätigte Teilnehmer, sonst NULL.';

-- ------------------------------------------------- Ausführrechte der RPCs
-- Die drei atomaren Fachoperationen prüfen die Anmeldung selbst und geben
-- NOT_AUTHENTICATED zurück (F3 AF-01/AF-02), statt am fehlenden Recht zu
-- scheitern - deshalb ist auch anon ausführungsberechtigt.
grant execute on function public.create_session(
  text, uuid, timestamptz, integer, integer, text, uuid, text, text, text, numeric, numeric
) to anon, authenticated;
grant execute on function public.join_session(uuid)      to anon, authenticated;
grant execute on function public.check_in(uuid, text)     to anon, authenticated;
grant execute on function public.session_pin(uuid)        to anon, authenticated;
grant execute on function public.confirmed_count(uuid)    to anon, authenticated;
grant execute on function public.session_status(timestamptz, integer) to anon, authenticated;
