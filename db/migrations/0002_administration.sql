SET search_path=potluck,public;
ALTER TABLE bills ADD COLUMN connection_version integer NOT NULL DEFAULT 1 CHECK(connection_version>0);
CREATE TABLE circle_transfers(
 id uuid PRIMARY KEY,
 circle_id uuid NOT NULL REFERENCES circles(id),
 sender_id uuid NOT NULL REFERENCES users(id),
 recipient_id uuid NOT NULL REFERENCES users(id),
 circle_version integer NOT NULL,
 version integer NOT NULL DEFAULT 1,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','declined','revoked','expired')),
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '7 days',
 CHECK(sender_id!=recipient_id)
);
CREATE UNIQUE INDEX circle_transfer_pending ON circle_transfers(circle_id) WHERE status='pending';
REVOKE ALL ON circle_transfers FROM PUBLIC;
