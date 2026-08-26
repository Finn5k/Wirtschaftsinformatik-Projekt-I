-- LocalCourt — Abgeleitete Merkmale
--
-- D1.6 führt status und confirmed_count als abgeleitete Merkmale und überlässt
-- die Umsetzungsentscheidung ausdrücklich der Architektur. A08 8.1.4 entscheidet
-- sie: ableitbare Werte werden nicht redundant persistiert. Beide entstehen
-- deshalb bei jeder Abfrage, nicht als Spalte und nicht per Job (F3 AF-03).
--
-- qr_content ist ebenfalls abgeleitet (D1.6), wird aber laut D2.8 clientseitig
-- erzeugt und "nicht als Feld oder Bild gespeichert" - deshalb hier bewusst nicht.

-- --------------------------------------------------- Statusableitung (AF-03)
-- Eine einzige Definition, die View und RPCs gemeinsam nutzen. Damit kann die
-- Prüfung in check_in (AF-02: Status muss active sein) nicht von der Anzeige
-- abweichen.
create function public.session_status(
  p_start_at     timestamptz,
  p_duration_min integer
)
returns text
language sql
stable
set search_path = ''
as $fn$
  select case
    when now() < p_start_at then 'scheduled'
    when now() < p_start_at + make_interval(mins => p_duration_min) then 'active'
    else 'completed'
  end;
$fn$;

comment on function public.session_status(timestamptz, integer) is
  'F3 AF-03 - leitet scheduled/active/completed aus Startzeit, Dauer und jetzt ab.';

-- ------------------------------------------------ Belegungszahl (D1.6/AF-01)
-- SECURITY DEFINER, weil hier zwei Regeln aufeinandertreffen: N2.2 beschränkt
-- das Lesen einzelner participant-Zeilen auf Organisator und Nutzer selbst,
-- während die Belegungsanzeige "x/max" laut UC-02/UC-03 für jeden sichtbar ist.
-- Weitergegeben wird ausschließlich die Aggregatzahl, nie eine Teilnahmezeile.
create function public.confirmed_count(p_session_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $fn$
  select count(*)::integer
    from public.participant
   where session_id = p_session_id
     and status in ('confirmed', 'checked_in');
$fn$;

comment on function public.confirmed_count(uuid) is
  'D1.6 confirmed_count - zählt confirmed und checked_in; gibt nur die Aggregatzahl heraus (N2.2).';

-- ------------------------------------------------------ Session-Lesesicht
-- Trägt die Felder, die UC-02 (Discovery), UC-03 (Detail) und UC-11 (Historie)
-- benötigen, inklusive Court und Sportart, damit die Dialogseiten dafür keine
-- Folgeabfragen brauchen.
--
-- Bewusst OHNE pin: N2.2 beschränkt die PIN auf Organisator und bestätigte
-- Teilnehmer; sie ist ausschließlich über public.session_pin() zugänglich.
--
-- security_invoker = on: Die View wendet die RLS-Policies des Aufrufers auf die
-- Basistabellen an, statt sie mit Eigentümerrechten zu umgehen. Die einzige
-- Stelle, die mehr Rechte braucht, ist die Belegungszahl - dafür gibt es die
-- gekapselte Funktion oben.
create view public.v_session
with (security_invoker = on) as
select
  s.session_id,
  s.sport_id,
  s.court_id,
  s.title,
  s.description,
  s.start_at,
  s.duration_min,
  s.max_participants,
  s.created_at,
  public.session_status(s.start_at, s.duration_min) as status,
  public.confirmed_count(s.session_id)              as confirmed_count,
  o.user_id                                         as organizer_user_id,
  sp.key                                            as sport_key,
  sp.display_name                                   as sport_display_name,
  c.name                                            as court_name,
  c.city                                            as court_city,
  c.address                                         as court_address,
  c.latitude                                        as court_latitude,
  c.longitude                                       as court_longitude
from public.session s
join public.organizer o on o.session_id = s.session_id
join public.sport sp    on sp.sport_id  = s.sport_id
join public.court c     on c.court_id   = s.court_id;

comment on view public.v_session is
  'Lesesicht auf session mit abgeleitetem status und confirmed_count (D1.6). Ohne pin (N2.2).';
