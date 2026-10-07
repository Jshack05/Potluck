SET search_path = potluck, public;
ALTER TABLE circles ADD COLUMN icon text NOT NULL DEFAULT 'circles' CHECK (icon IN ('circles','home','heart','star'));
ALTER TABLE circles ADD COLUMN color text NOT NULL DEFAULT 'lilac' CHECK (color IN ('lilac','mint','peach','blue'));
ALTER TABLE circles ADD COLUMN members_can_invite boolean NOT NULL DEFAULT false;
ALTER TABLE circles ADD COLUMN require_host_approval boolean NOT NULL DEFAULT true;
ALTER TABLE invitations DROP CONSTRAINT invitations_status_check;
ALTER TABLE invitations ADD CONSTRAINT invitations_status_check CHECK (status IN ('awaiting_host_approval','pending','accepted','declined','revoked','expired'));
DROP INDEX invitation_pending;
CREATE UNIQUE INDEX invitation_pending ON invitations(circle_id,recipient_id) WHERE status IN ('pending','awaiting_host_approval');
-- Existing Circles keep host-only invitations. Roll back code without dropping
-- these columns or invitation history; resolve pending suggestions explicitly.
