-- Migrarea V9.1: coloana newly_discovered din cached_live_jobs
--
-- Coloana a intrat in entitatea CachedJobListing fara nicio migrare, iar V10 creeaza un index
-- pe ea, asa ca pe o baza goala Flyway se oprea la V10. Versiunea 9.1 o adauga inainte de V10.
-- Bazele care sunt deja la V11 au coloana (adaugata manual, boolean cu default false):
-- acolo Flyway ruleaza aceasta migrare in afara ordinii (spring.flyway.out-of-order), fara efect.

ALTER TABLE cached_live_jobs ADD COLUMN IF NOT EXISTS newly_discovered BOOLEAN DEFAULT FALSE;

-- Acelasi default oriunde, indiferent cum a fost adaugata coloana pe bazele existente
ALTER TABLE cached_live_jobs ALTER COLUMN newly_discovered SET DEFAULT FALSE;
