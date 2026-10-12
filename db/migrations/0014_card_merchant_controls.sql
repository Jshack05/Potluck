-- Intended host configuration only. No issuer authorization or funding state.
CREATE TABLE card_merchant_controls (
  card_id uuid PRIMARY KEY REFERENCES cards(id),
  mode text NOT NULL CHECK (mode IN ('maximum', 'range')),
  currency text NOT NULL CHECK (currency = 'USD'),
  minimum_minor integer CHECK (minimum_minor BETWEEN 0 AND 100000000),
  maximum_minor integer NOT NULL CHECK (maximum_minor BETWEEN 1 AND 100000000),
  industries text[] NOT NULL CHECK (
    industries <@ ARRAY['groceries','utilities','internet','dining','fuel','transport','travel','shopping','health','entertainment']::text[]
    AND array_position(industries, NULL) IS NULL
    AND cardinality(industries) <= 10
    AND COALESCE(array_ndims(industries), 1) = 1
  ),
  version integer NOT NULL CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (mode = 'maximum' AND minimum_minor IS NULL)
    OR (mode = 'range' AND minimum_minor IS NOT NULL AND minimum_minor <= maximum_minor)
  )
);
