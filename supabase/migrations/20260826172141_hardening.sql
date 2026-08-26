-- LocalCourt — Nachschaerfung der Rechte
--
-- Ergebnis des Supabase-Security-Advisors nach der ersten Fassung. Zwei echte
-- Befunde, ein bewusst akzeptierter.

-- ============================================ 1. Trigger-Funktionen kapseln
-- handle_new_auth_user und delete_organized_sessions sind Trigger-Funktionen.
-- Ueber die Supabase-Standardrechte auf public waren sie zusaetzlich als
-- RPC-Endpunkt (/rest/v1/rpc/...) aufrufbar - unbeabsichtigt und ohne jeden
-- fachlichen Grund. Sie werden ausschliesslich vom Trigger aufgerufen und
-- brauchen fuer Endnutzer kein Ausfuehrrecht.
revoke execute on function public.handle_new_auth_user()      from anon, authenticated, public;
revoke execute on function public.delete_organized_sessions() from anon, authenticated, public;

-- ================================= 2. Profil-Sichtbarkeit ohne Definer-View
-- Die erste Fassung loeste die Spaltentrennung aus N2.2/D1.4 ueber eine View
-- mit Eigentuemerrechten. Der Advisor stuft das zu Recht als Fehler ein: eine
-- solche View umgeht die Policies des Aufrufers vollstaendig.
--
-- Saubere Umsetzung derselben Regel:
--   - Zeilenpolicy gibt alle Profilzeilen frei,
--   - das Spalten-GRANT gibt nur die Basisfelder frei (D1.4 "Datenschutz":
--     fuer andere Nutzer sind ausschliesslich display_name und avatar_url
--     sichtbar; city ist nur die eigene Ortsvorbelegung),
--   - das eigene vollstaendige Profil liefert my_profile().
drop view if exists public.v_profile_public;

drop policy if exists profile_select_self on public.profile;

revoke select on public.profile from authenticated;

grant select (user_id, display_name, avatar_url) on public.profile to authenticated;

create policy profile_select_basics on public.profile
  for select to authenticated
  using (true);

-- Eigenes Profil inklusive city. SECURITY DEFINER ist hier notwendig, weil ein
-- Spalten-GRANT rollenweit gilt und "eigene Zeile ganz, fremde Zeile teilweise"
-- nicht ausdruecken kann. Die Funktion gibt ausschliesslich die Zeile des
-- aufrufenden Nutzers heraus.
create function public.my_profile()
returns table (
  user_id      uuid,
  display_name text,
  city         text,
  avatar_url   text,
  created_at   timestamptz
)
language sql
stable
security definer
set search_path = ''
as $fn$
  select p.user_id, p.display_name, p.city, p.avatar_url, p.created_at
    from public.profile p
   where p.user_id = auth.uid();
$fn$;

comment on function public.my_profile() is
  'UC-12 - eigenes Profil inkl. city; fremde Profile zeigen nur die Basisfelder (D1.4 Datenschutz).';

-- Supabase vergibt Ausfuehrrechte auf neue Funktionen standardmaessig breit.
-- Fuer anon liefert my_profile() zwar ohnehin keine Zeile (auth.uid() ist NULL),
-- die Endpunktflaeche wird aber unnoetig groesser.
revoke execute on function public.my_profile() from anon;
grant  execute on function public.my_profile() to authenticated;

-- ====================================== 3. Bewusst offene SECURITY DEFINER
-- Der Advisor warnt weiterhin fuer create_session, join_session, check_in,
-- session_pin, confirmed_count und my_profile. Das ist beabsichtigt und genau
-- die in ADR-001/ADR-002 beschriebene API-Flaeche:
--
--   create_session/join_session/check_in  - der alleinige Schreibpfad; sie sind
--       SECURITY DEFINER, WEIL N2.2 direkte INSERT/UPDATE verbietet. Die
--       Anmeldung pruefen sie selbst und antworten mit NOT_AUTHENTICATED
--       (F3 AF-01/AF-02), statt am fehlenden Recht zu scheitern - deshalb ist
--       auch anon ausfuehrungsberechtigt.
--   session_pin       - setzt die Spalten-Policy aus N2.2 durch und gibt sonst NULL.
--   confirmed_count   - gibt nur eine Aggregatzahl heraus, die ueber v_session
--       ohnehin oeffentlich ist; wird von der View mit Aufruferrechten benoetigt.
--   my_profile        - liefert ausschliesslich die eigene Zeile.
--
-- session_status ist eine reine Funktion ihrer Argumente ohne Datenzugriff.
