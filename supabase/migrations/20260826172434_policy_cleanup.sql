-- LocalCourt — Zusammenfassung der participant-Policies und fehlende FK-Indizes
--
-- Ergebnis des Supabase-Performance-Advisors.

-- ============================ Zwei SELECT-Policies zu einer zusammenfassen
-- N2.2 nennt für participant zwei Lesegründe - eigener Datensatz (UC-05,
-- UC-11) und Organisator der Session (Teilnehmerliste, UC-07). Als zwei
-- permissive Policies muss PostgreSQL bei jeder Abfrage beide auswerten.
-- Fachlich ist es eine Oder-Bedingung, also auch eine Policy.
drop policy if exists participant_select_self         on public.participant;
drop policy if exists participant_select_as_organizer on public.participant;

create policy participant_select on public.participant
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1
        from public.organizer o
       where o.session_id = participant.session_id
         and o.user_id = (select auth.uid())
    )
  );

-- ================================================ Fremdschlüssel-Indizes
-- Beide Fremdschlüssel werden beim Löschen eines Profils durchlaufen
-- (D1.4 "Datenschutz & Löschung": created_by wird geleert, Präferenzen
-- entfallen). Ohne Index bedeutet das je einen vollständigen Tabellenscan.
create index court_created_by_idx        on public.court (created_by);
create index sport_preference_sport_idx  on public.sport_preference (sport_id);
