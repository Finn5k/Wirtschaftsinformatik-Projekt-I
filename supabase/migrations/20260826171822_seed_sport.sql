-- LocalCourt — Sportarten-Katalog
--
-- D1.4 sport, "Initialer Katalog (MVP)": sieben Eintraege, erweiterbar ohne
-- Modellaenderung. sport ist Stammdatum und wird nicht von Endnutzern gepflegt,
-- deshalb gehoert der Katalog in eine Migration und nicht in die Anwendung.

insert into public.sport (key, display_name) values
  ('running',    'Laufen'),
  ('cycling',    'Radfahren'),
  ('football',   'Fußball'),
  ('basketball', 'Basketball'),
  ('badminton',  'Badminton'),
  ('swimming',   'Schwimmen'),
  ('other',      'Sonstiges')
on conflict (key) do nothing;
