-- Preserve all existing looks while adding the approved appearance chooser values.
ALTER TABLE cards DROP CONSTRAINT cards_design_check;
ALTER TABLE cards ADD CONSTRAINT cards_design_check CHECK (design IN ('teal','graphite','aurora','aurora_gradient','sunset','coral','ocean','berry'));
-- UI rollback must retain the extended values and use a fallback preview; do not rewrite user choices.
