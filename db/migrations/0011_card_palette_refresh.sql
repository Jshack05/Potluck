-- Eight additional approved Figma appearances; existing saved IDs stay valid.
ALTER TABLE cards DROP CONSTRAINT cards_design_check;
ALTER TABLE cards ADD CONSTRAINT cards_design_check CHECK (design IN (
  'teal','graphite','aurora','aurora_gradient','sunset','coral','ocean','berry',
  'brushed_silver','frosted_glass','champagne','satin_teal',
  'ocean_artwork','sunset_artwork','botanical','midnight','terracotta',
  'alpine','prism','orbit','lagoon',
  'cobalt_gradient','tidal_gradient','ember_gradient','iris_gradient',
  'evergreen_twotone','clay_twotone','indigo_twotone','slate_twotone'
));
-- Apply before clients expose new choices. No backfill or financial state change.
-- Roll back the UI if necessary, retaining this constraint and all saved IDs.
