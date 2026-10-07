-- Goal drafts contain planning preferences only. No consent, funds or provider state.
CREATE TABLE goals (
  id uuid PRIMARY KEY,
  host_id uuid NOT NULL REFERENCES users(id),
  circle_id uuid REFERENCES circles(id),
  card_id uuid REFERENCES cards(id),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  kind text NOT NULL CHECK (kind IN ('target','time_based')),
  target_minor integer CHECK (target_minor > 0 AND target_minor <= 100000000),
  end_date date,
  first_contribution_date date NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('monthly','weekly')),
  currency text NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  lock_funds_requested boolean NOT NULL DEFAULT false,
  show_contributions boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status = 'draft'),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((kind='target' AND target_minor IS NOT NULL AND end_date IS NULL) OR (kind='time_based' AND target_minor IS NULL)),
  CHECK (end_date IS NULL OR end_date >= first_contribution_date)
);
CREATE INDEX goals_host_created ON goals(host_id, created_at DESC, id);
CREATE TABLE goal_planned_contributions (
  goal_id uuid NOT NULL REFERENCES goals(id),
  person_id uuid NOT NULL REFERENCES users(id),
  amount_minor integer NOT NULL CHECK (amount_minor > 0 AND amount_minor <= 100000000),
  currency text NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (goal_id, person_id)
);
-- Rollback: revert app routes while retaining drafts and audit history; no data deletion.
