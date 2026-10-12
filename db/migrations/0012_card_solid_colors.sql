-- Additional solid colors authored in Figma on October 12. Existing IDs retained.
ALTER TABLE cards DROP CONSTRAINT cards_design_check;
ALTER TABLE cards ADD CONSTRAINT cards_design_check CHECK (design IN (
  'teal','graphite','aurora','aurora_gradient','sunset','coral','ocean','berry',
  'brushed_silver','frosted_glass','champagne','satin_teal',
  'ocean_artwork','sunset_artwork','botanical','midnight','terracotta',
  'alpine','prism','orbit','lagoon',
  'cobalt_gradient','tidal_gradient','ember_gradient','iris_gradient',
  'evergreen_twotone','clay_twotone','indigo_twotone','slate_twotone',
  'navy_solid','plum_solid','sage_solid','sand_solid'
));
-- Deploy before the client catalog. Rollback retains saved values and constraint.
