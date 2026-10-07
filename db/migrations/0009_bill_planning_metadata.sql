SET search_path = potluck, public;
ALTER TABLE bills ADD COLUMN icon text NOT NULL DEFAULT 'bill'
  CHECK (icon IN ('internet','phone','tv','lightning','rent','water','trash','groceries','car','insurance','streaming','medical','bill','utilities','gas'));
ALTER TABLE bills ADD COLUMN color text NOT NULL DEFAULT 'teal'
  CHECK (color IN ('teal','blue','coral','gold','purple'));
ALTER TABLE bills DROP CONSTRAINT bills_status_check;
ALTER TABLE bills ADD CONSTRAINT bills_status_check CHECK (status IN ('draft','proposed','ended'));
