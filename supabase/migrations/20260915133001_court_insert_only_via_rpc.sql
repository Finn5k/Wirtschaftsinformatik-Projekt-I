-- LocalCourt — Court-Anlage ausschließlich über create_session
--
-- Die erste RLS-Fassung (…171948_rls.sql) erteilte authenticated ein INSERT auf
-- court mit der Policy court_insert, weil S1.4 damals einen eigenen Schreibzugriff
-- „courtAnlegen" vorsah. Den gibt es nicht mehr: Ein neu erfasster Sportort
-- entsteht innerhalb von create_session, damit kein Court ohne zugehörige Session
-- zurückbleibt (S1.4, A06 §6.3, ADR-001). Das Recht blieb dennoch bestehen und
-- öffnete einen Schreibpfad, den die Architektur ausschließt — ein umgangener
-- Client konnte verwaiste Courts anlegen.
--
-- create_session ist SECURITY DEFINER und braucht das Recht nicht; das Frontend
-- ruft kein INSERT auf court auf (courtService liest nur).

revoke insert on public.court from authenticated;

drop policy if exists court_insert on public.court;

comment on table public.court is
  'D1.4 court - Sportort; entsteht nur in create_session (S1.4). created_by wird beim Löschen des Profils geleert, der Court bleibt.';
