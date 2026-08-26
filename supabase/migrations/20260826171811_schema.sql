-- LocalCourt — Basisschema
--
-- Setzt die Entitaeten aus D1.4 und die Wertebereiche aus D2 um.
-- Beziehungen B1-B8 aus D1.5, Invarianten aus D1.4/D1.5.
-- Abgeleitete Merkmale (status, confirmed_count, qr_content) sind bewusst
-- KEINE Spalten (D1.6, A08 8.1.4) und entstehen in den Views.

-- ---------------------------------------------------------------- profile
-- D1.4 profile: user_id ist die uebernommene Auth-Kennung aus NB-02 (D2.2).
create table public.profile (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  display_name text        not null check (length(btrim(display_name)) > 0),
  city         text        check (city is null or length(btrim(city)) > 0),
  avatar_url   text,
  created_at   timestamptz not null default now()
);

comment on table public.profile is
  'D1.4 profile - technischer Nutzeraccount; user_id = Auth-Kennung aus NB-02.';

-- ------------------------------------------------------------------ sport
-- D1.4 sport: Referenz-/Stammdaten, nicht durch Endnutzer pflegbar.
create table public.sport (
  sport_id     uuid primary key default gen_random_uuid(),
  key          text not null unique check (key ~ '^[a-z_]+$'),
  display_name text not null check (length(btrim(display_name)) > 0)
);

comment on table public.sport is
  'D1.4 sport - Katalog der Sportarten (Stammdaten).';

-- ------------------------------------------------------------------ court
-- D1.4 court: name, city und Koordinatenpaar sind Pflicht (Invariante UC-10).
-- D2.7 fuehrt das Koordinatenpaar fachlich als EIN Attribut. Technisch sind es
-- zwei NOT-NULL-Spalten: damit ist ein unvollstaendiges Paar - der eigentliche
-- Gegenstand der D2.7-Invariante - ausgeschlossen, waehrend Breite und Laenge
-- einzeln indizierbar und ohne Umwandlung als JSON abrufbar bleiben.
create table public.court (
  court_id   uuid primary key default gen_random_uuid(),
  name       text          not null check (length(btrim(name)) > 0),
  city       text          not null check (length(btrim(city)) > 0),
  address    text,
  latitude   numeric(9, 6) not null check (latitude between -90 and 90),
  longitude  numeric(9, 6) not null check (longitude between -180 and 180),
  created_by uuid          references public.profile (user_id) on delete set null,
  created_at timestamptz   not null default now()
);

comment on table public.court is
  'D1.4 court - Sportort; created_by wird beim Loeschen des Profils geleert, der Court bleibt.';

-- ---------------------------------------------------------------- session
-- D1.4 session. Die Bedingung "start_at liegt in der Zukunft" gilt nur zur
-- Erstellungszeit (UC-06) und steht deshalb in create_session, nicht als CHECK.
create table public.session (
  session_id       uuid primary key default gen_random_uuid(),
  sport_id         uuid        not null references public.sport (sport_id),
  court_id         uuid        not null references public.court (court_id),
  title            text        not null check (length(btrim(title)) > 0),
  description      text,
  start_at         timestamptz not null,
  duration_min     integer     not null check (duration_min >= 1),
  max_participants integer     not null check (max_participants >= 1),
  pin              text        not null check (pin ~ '^[0-9]{4}$'),
  created_at       timestamptz not null default now()
);

comment on table public.session is
  'D1.4 session - Sport-Session. status und confirmed_count sind abgeleitet (D1.6), keine Spalten.';
comment on column public.session.pin is
  'D2.4 Pin - vierstellig numerisch, im Klartext gespeichert (bewusstes Sicherheitsniveau).';

-- -------------------------------------------------------------- organizer
-- D1.4 organizer, Beziehung B8 (1:1 zu session) ueber UNIQUE(session_id).
create table public.organizer (
  organizer_id uuid primary key default gen_random_uuid(),
  session_id   uuid not null unique references public.session (session_id) on delete cascade,
  user_id      uuid not null references public.profile (user_id) on delete cascade
);

comment on table public.organizer is
  'D1.4 organizer - Organisation einer Session (B8, 1:1); traegt keinen Kapazitaets- oder Check-in-Zustand.';

-- ------------------------------------------------------------ participant
-- D1.4 participant mit beiden Invarianten:
--   Eindeutigkeit     - hoechstens eine Teilnahme je (session_id, user_id)
--   Check-in-Kopplung - checked_in_at gesetzt <=> status = 'checked_in'
create table public.participant (
  participant_id uuid        primary key default gen_random_uuid(),
  session_id     uuid        not null references public.session (session_id) on delete cascade,
  user_id        uuid        not null references public.profile (user_id) on delete cascade,
  status         text        not null check (status in ('confirmed', 'checked_in')),
  joined_at      timestamptz not null default now(),
  checked_in_at  timestamptz,
  constraint participant_unique_je_session unique (session_id, user_id),
  constraint participant_checkin_kopplung
    check ((status = 'checked_in') = (checked_in_at is not null))
);

comment on table public.participant is
  'D1.4 participant - Teilnahme; D2.5 kennt bewusst keinen Wert waiting (P1 NG-10).';

-- ------------------------------------------------------- sport_preference
-- D1.4 sport_preference, Beziehung B6; fachliche Identitaet = (user_id, sport_id).
create table public.sport_preference (
  user_id  uuid not null references public.profile (user_id) on delete cascade,
  sport_id uuid not null references public.sport (sport_id) on delete cascade,
  primary key (user_id, sport_id)
);

comment on table public.sport_preference is
  'D1.4 sport_preference - Aufloesung der n:m-Beziehung Profil<->Sportart (B6).';

-- ---------------------------------------------------------------- Indizes
-- Tragen die Zugriffspfade aus UC-02 (Ort/Sportart/Zeit) und UC-05/UC-07.
create index court_city_idx          on public.court (city);
create index session_start_at_idx    on public.session (start_at);
create index session_sport_id_idx    on public.session (sport_id);
create index session_court_id_idx    on public.session (court_id);
create index participant_user_id_idx on public.participant (user_id);
create index organizer_user_id_idx   on public.organizer (user_id);

-- ------------------------------------------ Profil bei Registrierung anlegen
-- UC-01: Der Auth-Nutzer entsteht in NB-02; D1.4 verlangt dazu ein profile mit
-- derselben Kennung. Der Anzeigename kommt aus den Registrierungsdaten.
create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  insert into public.profile (user_id, display_name)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$fn$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ----------------------------------- Organisierte Sessions mitloeschen (D1.4)
-- D1.4 profile, "Datenschutz & Loeschung": Beim Loeschen eines Kontos entfallen
-- auch die organisierten Sessions. Ohne diesen Trigger bliebe die Session ohne
-- organizer-Eintrag zurueck und verletzte B8.
create function public.delete_organized_sessions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  delete from public.session s
   where exists (
     select 1
       from public.organizer o
      where o.session_id = s.session_id
        and o.user_id = old.user_id
   );
  return old;
end;
$fn$;

create trigger before_profile_delete
  before delete on public.profile
  for each row execute function public.delete_organized_sessions();
