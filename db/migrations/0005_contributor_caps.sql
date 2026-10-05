-- A contributor may choose a hard cap below a Flexible Bill estimate.
-- This permits a stop, never a partial payment. Fixed accepted shares stay exact.
-- Forward-only: restoring the old constraint would require rejecting valid
-- contributor choices. No financial or consent records are rewritten.
ALTER TABLE agreements DROP CONSTRAINT agreements_check;
ALTER TABLE agreements ADD CONSTRAINT agreement_personal_cap
  CHECK (maximum_minor BETWEEN 0 AND 100000000 AND
    (terms->>'kind' = 'flexible' OR maximum_minor >= amount_minor));
