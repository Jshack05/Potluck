CREATE SCHEMA IF NOT EXISTS potluck;
SET search_path = potluck, public;
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  identity text NOT NULL CHECK (identity IN ('local','supabase')),
  password_hash text,
  disabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sessions (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE circles (
  id uuid PRIMARY KEY,
  host_id uuid NOT NULL REFERENCES users(id),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  privacy text NOT NULL CHECK (privacy IN ('normal','anonymous')),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE memberships (
  circle_id uuid NOT NULL REFERENCES circles(id),
  user_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL CHECK (status IN ('accepted','left','removed')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(circle_id,user_id)
);
CREATE TABLE invitations (
  id uuid PRIMARY KEY,
  circle_id uuid NOT NULL REFERENCES circles(id),
  sender_id uuid NOT NULL REFERENCES users(id),
  recipient_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','revoked','expired')),
  version integer NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX invitation_pending ON invitations(circle_id,recipient_id) WHERE status='pending';
CREATE TABLE cards (
  id uuid PRIMARY KEY,
  host_id uuid NOT NULL REFERENCES users(id),
  circle_id uuid REFERENCES circles(id),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  design text NOT NULL CHECK (design IN ('teal','graphite','aurora')),
  status text NOT NULL DEFAULT 'setup_required' CHECK (status IN ('setup_required','closed')),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE bills (
  id uuid PRIMARY KEY,
  host_id uuid NOT NULL REFERENCES users(id),
  circle_id uuid REFERENCES circles(id),
  card_id uuid REFERENCES cards(id),
  name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('fixed','flexible')),
  amount_minor integer NOT NULL CHECK (amount_minor > 0 AND amount_minor <= 100000000),
  maximum_minor integer CHECK (maximum_minor >= amount_minor),
  currency text NOT NULL CHECK (currency='USD'),
  frequency text NOT NULL CHECK (frequency IN ('once','weekly','monthly')),
  first_due_date date NOT NULL,
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','ended')),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (kind != 'flexible' OR maximum_minor IS NOT NULL)
);
CREATE TABLE agreements (
  id uuid PRIMARY KEY,
  bill_id uuid NOT NULL REFERENCES bills(id),
  participant_id uuid NOT NULL REFERENCES users(id),
  amount_minor integer NOT NULL CHECK (amount_minor >= 0),
  maximum_minor integer NOT NULL CHECK (maximum_minor >= amount_minor),
  currency text NOT NULL CHECK (currency='USD'),
  terms_version integer NOT NULL CHECK (terms_version > 0),
  terms jsonb NOT NULL,
  status text NOT NULL DEFAULT 'offered' CHECK (status IN ('offered','accepted','declined','superseded','canceled','withdrawn')),
  funding_status text NOT NULL DEFAULT 'not_authorized' CHECK (funding_status='not_authorized'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(bill_id,participant_id,terms_version)
);
CREATE UNIQUE INDEX agreement_current_acceptance ON agreements(bill_id,participant_id) WHERE status='accepted';
CREATE TABLE listings (
  id uuid PRIMARY KEY,
  host_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL,
  brand text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (category IN ('subscriptions','memberships','plans','housing')),
  description text NOT NULL,
  share_minor integer NOT NULL CHECK (share_minor > 0),
  total_minor integer CHECK (total_minor >= share_minor),
  capacity integer NOT NULL CHECK (capacity BETWEEN 2 AND 50),
  filled integer NOT NULL CHECK (filled >= 1 AND filled < capacity),
  location text NOT NULL DEFAULT '',
  move_in date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','closed','verification_required')),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE requests (
  id uuid PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES listings(id),
  requester_id uuid NOT NULL REFERENCES users(id),
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','withdrawn')),
  version integer NOT NULL DEFAULT 1,
  rules_version text NOT NULL,
  rules_accepted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(listing_id,requester_id)
);
CREATE TABLE conversations (
  id uuid PRIMARY KEY,
  listing_id uuid REFERENCES listings(id),
  request_id uuid UNIQUE REFERENCES requests(id),
  host_id uuid NOT NULL REFERENCES users(id),
  participant_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK(host_id != participant_id)
);
CREATE TABLE messages (
  id uuid PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES conversations(id),
  sender_id uuid NOT NULL REFERENCES users(id),
  text text NOT NULL CHECK (length(text) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE saved_listings (
  user_id uuid NOT NULL REFERENCES users(id),
  listing_id uuid NOT NULL REFERENCES listings(id),
  PRIMARY KEY(user_id,listing_id)
);
CREATE TABLE blocks (
  user_id uuid NOT NULL REFERENCES users(id),
  blocked_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id,blocked_id),
  CHECK(user_id != blocked_id)
);
CREATE TABLE reports (
  id uuid PRIMARY KEY,
  reporter_id uuid NOT NULL REFERENCES users(id),
  listing_id uuid REFERENCES listings(id),
  reason text NOT NULL CHECK (length(reason) BETWEEN 5 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE audit_events (
  id uuid PRIMARY KEY,
  actor_id uuid NOT NULL REFERENCES users(id),
  action text NOT NULL,
  resource_id uuid NOT NULL,
  request_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE idempotency (
  actor_id uuid NOT NULL REFERENCES users(id),
  key text NOT NULL,
  request_hash text NOT NULL,
  response jsonb NOT NULL,
  status_code integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(actor_id,key)
);
CREATE TABLE outbox (
  id uuid PRIMARY KEY,
  recipient_id uuid NOT NULL REFERENCES users(id),
  kind text NOT NULL,
  resource_id uuid NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX memberships_user ON memberships(user_id,status);
CREATE INDEX agreements_participant ON agreements(participant_id,status);
CREATE INDEX messages_conversation ON messages(conversation_id,created_at,id);
CREATE INDEX listings_public ON listings(status,category,created_at);
CREATE INDEX outbox_recipient ON outbox(recipient_id,created_at);
CREATE FUNCTION prevent_audit_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Audit events are immutable'; END;
$$;
CREATE TRIGGER audit_immutable BEFORE UPDATE OR DELETE ON audit_events FOR EACH ROW EXECUTE FUNCTION prevent_audit_change();
REVOKE ALL ON SCHEMA potluck FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA potluck FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA potluck REVOKE ALL ON TABLES FROM PUBLIC;
