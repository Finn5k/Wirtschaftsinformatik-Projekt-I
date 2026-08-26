-- LocalCourt — Atomare Fachoperationen
--
-- ADR-001: create_session, join_session und check_in sind der alleinige
-- Schreibpfad fuer Erstellung, Beitritt und Check-in. Sie laufen als eine
-- unteilbare Transaktion in der Datenbank, weil TECH-03 eine eigene
-- Backend-Schicht ausschliesst und die Kapazitaets- und Check-in-Invariante
-- (N1-QA-01) unabhaengig vom Client-Verhalten gelten muss.
--
-- Alle drei sind SECURITY DEFINER: N2.2 verbietet direkte INSERT/UPDATE auf
-- session, organizer und participant; geschrieben wird ausschliesslich hier.
--
-- Fachliche Ergebniscodes werden als SQLSTATE 'PTxyz' geworfen. PostgREST
-- uebersetzt diese in den HTTP-Status xyz und liefert den Ergebniscode als
-- message - genau die Zuordnung, die F3 je Anwendungsfunktion festlegt.
-- Ein technischer Fehler ist davon zu unterscheiden (N2.3).

-- ============================================================ create_session
-- UC-06 und UC-10. Legt Session, organizer-Eintrag und die Teilnahme des
-- Organisators gemeinsam an: D1.5 "Organisator-als-Teilnehmer" darf nicht durch
-- einen fehlschlagenden Zwischenschritt verletzt werden (ADR-001 Begruendung).
-- Der Court wird optional in derselben Transaktion erfasst (UC-10, A06 6.3).
--
-- F3 definiert fuer create_session bewusst kein eigenes Ergebniscode-Set
-- (A09 ADR-001); geworfen werden nur NOT_AUTHENTICATED und Eingabefehler.
create function public.create_session(
  p_title            text,
  p_sport_id         uuid,
  p_start_at         timestamptz,
  p_duration_min     integer,
  p_max_participants integer,
  p_description      text          default null,
  p_court_id         uuid          default null,
  p_court_name       text          default null,
  p_court_city       text          default null,
  p_court_address    text          default null,
  p_court_latitude   numeric       default null,
  p_court_longitude  numeric       default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_user_id  uuid := auth.uid();
  v_court_id uuid := p_court_id;
  v_pin      text;
  v_session  public.session;
begin
  if v_user_id is null then
    raise sqlstate 'PT401' using
      message = 'NOT_AUTHENTICATED',
      detail  = 'Session-Erstellung setzt eine Anmeldung voraus (UC-06).';
  end if;

  -- UC-06: Der Startzeitpunkt muss bei der Erstellung in der Zukunft liegen.
  -- Als Tabellen-CHECK waere die Regel falsch, weil sie spaeter zwangslaeufig
  -- verletzt wuerde (D1.4 session).
  if p_start_at <= now() then
    raise sqlstate 'PT400' using
      message = 'START_IN_PAST',
      detail  = 'Der Startzeitpunkt muss in der Zukunft liegen (UC-06).';
  end if;

  -- UC-10: entweder ein bestehender Court oder eine vollstaendige Neuerfassung.
  -- D1.4 court verlangt name, city und ein vollstaendiges Koordinatenpaar.
  if v_court_id is null then
    if p_court_name is null or p_court_city is null
       or p_court_latitude is null or p_court_longitude is null then
      raise sqlstate 'PT400' using
        message = 'COURT_INCOMPLETE',
        detail  = 'Neuer Court benoetigt Name, Ort und Koordinatenpaar (UC-10, D2.7).';
    end if;

    insert into public.court (name, city, address, latitude, longitude, created_by)
    values (p_court_name, p_court_city, p_court_address,
            p_court_latitude, p_court_longitude, v_user_id)
    returning court_id into v_court_id;
  end if;

  -- AF-04: PIN einmalig bei der Erstellung, vierstellig numerisch, mit
  -- bedeutungstragenden fuehrenden Nullen (D2.4).
  v_pin := lpad((floor(random() * 10000))::integer::text, 4, '0');

  insert into public.session (
    sport_id, court_id, title, description,
    start_at, duration_min, max_participants, pin
  )
  values (
    p_sport_id, v_court_id, p_title, p_description,
    p_start_at, p_duration_min, p_max_participants, v_pin
  )
  returning * into v_session;

  -- B8: genau ein organizer-Eintrag je Session.
  insert into public.organizer (session_id, user_id)
  values (v_session.session_id, v_user_id);

  -- D1.5 Invariante "Organisator-als-Teilnehmer": zaehlt ab Erstellung als
  -- bestaetigter Teilnehmer und belegt damit einen Kapazitaetsplatz (F1 GP-01 A2).
  insert into public.participant (session_id, user_id, status)
  values (v_session.session_id, v_user_id, 'confirmed');

  return jsonb_build_object(
    'code',       'OK',
    'session_id', v_session.session_id,
    'pin',        v_session.pin
  );
end;
$fn$;

comment on function public.create_session is
  'UC-06/UC-10 - legt Court (optional), Session, organizer und Organisator-Teilnahme atomar an (ADR-001).';

-- ============================================================== join_session
-- AF-01. Prueffolge exakt wie im Algorithmus: Anmeldung, Sessionstatus,
-- Doppelbeitritt, Kapazitaet. Die erste zutreffende Bedingung bricht ab.
create function public.join_session(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_user_id         uuid := auth.uid();
  v_session         public.session;
  v_confirmed_count integer;
  v_participant     public.participant;
begin
  if v_user_id is null then
    raise sqlstate 'PT401' using
      message = 'NOT_AUTHENTICATED',
      detail  = 'Beitritt setzt eine Anmeldung voraus (F3 AF-01).';
  end if;

  -- FOR UPDATE serialisiert konkurrierende Beitritte zu DERSELBEN Session.
  -- Ohne diese Sperre koennten zwei Aufrufe gleichzeitig zaehlen und beide den
  -- letzten freien Platz belegen - genau die Kapazitaetsverletzung, die
  -- N1-QA-01 ausschliesst ("Atomaritaet statt Reihenfolgegarantie").
  select * into v_session
    from public.session
   where session_id = p_session_id
   for update;

  if not found then
    raise sqlstate 'PT404' using
      message = 'SESSION_NOT_FOUND',
      detail  = 'Es existiert keine Session mit dieser Kennung.';
  end if;

  if public.session_status(v_session.start_at, v_session.duration_min) = 'completed' then
    raise sqlstate 'PT409' using
      message = 'SESSION_NOT_JOINABLE',
      detail  = 'Die Session ist beendet (F3 AF-01, AF-03).';
  end if;

  if exists (
    select 1 from public.participant
     where session_id = p_session_id and user_id = v_user_id
  ) then
    raise sqlstate 'PT409' using
      message = 'ALREADY_JOINED',
      detail  = 'Es besteht bereits eine Teilnahme an dieser Session (F3 AF-01 R3).';
  end if;

  -- D1.6: confirmed_count zaehlt confirmed UND checked_in.
  select count(*) into v_confirmed_count
    from public.participant
   where session_id = p_session_id
     and status in ('confirmed', 'checked_in');

  if v_session.max_participants - v_confirmed_count <= 0 then
    raise sqlstate 'PT409' using
      message = 'SESSION_FULL',
      detail  = 'Die Kapazitaetsgrenze ist erreicht; es gibt keine Warteliste (P1 NG-10).';
  end if;

  insert into public.participant (session_id, user_id, status)
  values (p_session_id, v_user_id, 'confirmed')
  returning * into v_participant;

  return jsonb_build_object(
    'code',           'OK',
    'participant_id', v_participant.participant_id,
    'status',         v_participant.status,
    'joined_at',      v_participant.joined_at
  );
end;
$fn$;

comment on function public.join_session(uuid) is
  'F3 AF-01 - Beitritts- und Kapazitaetsregel; haelt die Kapazitaetsinvariante per Zeilensperre.';

-- ================================================================= check_in
-- AF-02. QR-Weg und manuelle PIN-Eingabe laufen durch dieselbe Funktion, weil
-- der QR-Inhalt dieselbe PIN traegt (AF-04, D2.8).
--
-- Reihenfolge laut Algorithmus: Teilnahme, Merkmal, Zeitfenster, vorhandener
-- Check-in. ALREADY_CHECKED_IN ist KEIN Fehler, sondern ein idempotenter Erfolg
-- und wird deshalb mit 200 zurueckgegeben, nicht geworfen (F3 AF-02-Mapping).
create function public.check_in(
  p_session_id uuid,
  p_pin        text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_user_id     uuid := auth.uid();
  v_session     public.session;
  v_participant public.participant;
begin
  if v_user_id is null then
    raise sqlstate 'PT401' using
      message = 'NOT_AUTHENTICATED',
      detail  = 'Check-in setzt eine Anmeldung voraus (F3 AF-02).';
  end if;

  select * into v_session
    from public.session
   where session_id = p_session_id;

  if not found then
    raise sqlstate 'PT404' using
      message = 'SESSION_NOT_FOUND',
      detail  = 'Es existiert keine Session mit dieser Kennung.';
  end if;

  select * into v_participant
    from public.participant
   where session_id = p_session_id and user_id = v_user_id
   for update;

  if not found then
    raise sqlstate 'PT403' using
      message = 'NOT_JOINED',
      detail  = 'Ohne vorherigen Beitritt ist kein Check-in moeglich (F3 AF-02).';
  end if;

  if p_pin is distinct from v_session.pin then
    raise sqlstate 'PT400' using
      message = 'INVALID_CREDENTIAL',
      detail  = 'Die vorgelegte PIN gehoert nicht zu dieser Session (F3 AF-02).';
  end if;

  -- AF-02 Zusicherung "Kein Toleranzfenster": massgeblich ist allein der
  -- abgeleitete Status active (AF-03).
  if public.session_status(v_session.start_at, v_session.duration_min) <> 'active' then
    raise sqlstate 'PT409' using
      message = 'OUTSIDE_WINDOW',
      detail  = 'Check-in ist nur waehrend der laufenden Session moeglich (F3 AF-02, AF-03).';
  end if;

  -- AF-02 Zusicherung "Keine Statusruecknahme": ein gesetzter Check-in bleibt
  -- bestehen und der Zeitpunkt wird nicht ueberschrieben.
  if v_participant.status = 'checked_in' then
    return jsonb_build_object(
      'code',          'ALREADY_CHECKED_IN',
      'checked_in_at', v_participant.checked_in_at
    );
  end if;

  update public.participant
     set status = 'checked_in',
         checked_in_at = now()
   where participant_id = v_participant.participant_id
   returning * into v_participant;

  return jsonb_build_object(
    'code',          'OK',
    'checked_in_at', v_participant.checked_in_at
  );
end;
$fn$;

comment on function public.check_in(uuid, text) is
  'F3 AF-02 - Check-in-Validierung; ALREADY_CHECKED_IN ist idempotenter Erfolg (200), kein Fehler.';
