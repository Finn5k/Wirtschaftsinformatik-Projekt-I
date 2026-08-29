-- LocalCourt — Profil-Basisfelder auch ohne Anmeldung lesbar
--
-- N2.2 gab die Basisfelder von `profile` nur angemeldeten Nutzern frei. Das
-- widerspricht der Dialogspezifikation:
--   - B1 DLG-04 führt den Organisator als Anzeigefeld
--     (`profile.display_name` über `organizer.user_id`),
--   - B1.2 macht DLG-04 ohne Anmeldung einsehbar, und
--   - B1.5.2 zählt die Detailansicht nicht zu den geschützten Aktionen.
-- Unangemeldet fehlte der Organisatorname deshalb.
--
-- Es ist dieselbe Überregulierung, die für `session` und `organizer` bereits
-- korrigiert wurde: N2.2 schrieb dort ebenfalls „angemeldet", während UC-02 und
-- B1.2 anonymes Lesen vorsehen.
--
-- Die Datensparsamkeit bleibt unberührt. D1.4 und N1-QA-03 bestimmen, WELCHE
-- Felder fremde Nutzer sehen — ausschließlich `display_name` und optional
-- `avatar_url` —, nicht, wer sie sehen darf. `city` bleibt der eigenen
-- Ortsvorbelegung vorbehalten und ist weiterhin nur über `my_profile()`
-- erreichbar, ebenso `created_at`.

drop policy if exists profile_select_basics on public.profile;

create policy profile_select_basics on public.profile
  for select
  to anon, authenticated
  using (true);

-- Das Spalten-GRANT bleibt die eigentliche Schranke: Es gibt genau die beiden
-- Basisfelder frei, `city` und `created_at` nicht.
grant select (user_id, display_name, avatar_url) on public.profile to anon;
