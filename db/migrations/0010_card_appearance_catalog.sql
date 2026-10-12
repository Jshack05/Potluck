-- Add approved Figma appearances; keep all existing Card design identities.
ALTER TABLE cards DROP CONSTRAINT cards_design_check;
ALTER TABLE cards ADD CONSTRAINT cards_design_check CHECK (design IN (
  'teal','graphite','aurora','aurora_gradient','sunset','coral','ocean','berry',
  'brushed_silver','frosted_glass','champagne','satin_teal',
  'ocean_artwork','sunset_artwork','botanical','midnight','terracotta',
  'alpine','prism','orbit','lagoon'
));
-- Roll out before clients send new IDs. Roll back UI, not persisted user choices
-- or this expanded constraint. No data backfill or financial state change.
