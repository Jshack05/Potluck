-- Synthetic account choices only. Never a funding source or onboarding signal.
CREATE TABLE beta_bank_accounts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  fixture_key text NOT NULL CHECK (fixture_key IN ('1-personal','2-household','3-savings')),
  name text NOT NULL,
  last4 text NOT NULL,
  state text NOT NULL DEFAULT 'simulated' CHECK (state = 'simulated'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id,fixture_key),
  UNIQUE(id,user_id),
  CHECK ((fixture_key = '1-personal' AND name = 'Personal checking' AND last4 = '4821')
      OR (fixture_key = '2-household' AND name = 'Household checking' AND last4 = '7390')
      OR (fixture_key = '3-savings' AND name = 'Everyday savings' AND last4 = '2186'))
);
ALTER TABLE cards ADD COLUMN beta_account_id uuid;
ALTER TABLE cards ADD CONSTRAINT cards_beta_account_owner_fk
  FOREIGN KEY (beta_account_id,host_id) REFERENCES beta_bank_accounts(id,user_id);
