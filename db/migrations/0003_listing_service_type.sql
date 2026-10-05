SET search_path=potluck,public;
ALTER TABLE listings ADD COLUMN service_kind text NOT NULL DEFAULT 'other' CHECK(service_kind IN ('tv','music','software','other'));
