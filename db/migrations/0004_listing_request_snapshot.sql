ALTER TABLE requests ADD COLUMN listing_version integer;
ALTER TABLE requests ADD COLUMN listing_snapshot jsonb;
UPDATE requests r SET listing_version=l.version,listing_snapshot=jsonb_build_object('title',l.title,'shareMinor',l.share_minor,'capacity',l.capacity,'description',l.description) FROM listings l WHERE l.id=r.listing_id;
ALTER TABLE requests ALTER COLUMN listing_version SET NOT NULL;
ALTER TABLE requests ALTER COLUMN listing_snapshot SET NOT NULL;
ALTER TABLE requests ADD CONSTRAINT request_listing_version_positive CHECK(listing_version>0);
ALTER TABLE requests DROP CONSTRAINT requests_listing_id_requester_id_key;
ALTER TABLE requests ADD CONSTRAINT requests_per_listing_version UNIQUE(listing_id,requester_id,listing_version);
