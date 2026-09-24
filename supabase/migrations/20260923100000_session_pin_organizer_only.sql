-- LocalCourt — Session-PIN nur für den Organisator
--
-- Die erste Fassung von session_pin() (…171948_rls.sql) gab die PIN auch
-- bestätigten Teilnehmern frei. B1 DLG-04 zeigt QR-Code und PIN aber nur im
-- Organisator-Zustand; ein Teilnehmer bekommt die PIN vom Organisator vor Ort.
-- Wer sie vorab per RPC lesen konnte, hätte sich ohne Anwesenheit einchecken
-- können. Die Funktion prüft deshalb nur noch den organizer-Eintrag.
--
-- Signatur, SECURITY DEFINER, search_path und Grants bleiben unverändert;
-- create or replace erhält die bestehenden Ausführungsrechte. Rückgabe wie
-- bisher NULL für alle anderen (N2.2: Sichtbarkeitsregel, kein Ergebniscode).
-- check_in vergleicht die PIN serverseitig und ist nicht betroffen.

create or replace function public.session_pin(p_session_id uuid)
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
  then
    return (select pin from public.session where session_id = p_session_id);
  end if;

  return null;
end;
$fn$;

comment on function public.session_pin(uuid) is
  'N2.2 Spalten-Policy - PIN nur für den Organisator der Session, sonst NULL.';
