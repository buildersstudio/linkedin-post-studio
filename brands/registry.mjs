/* The list of brands the studio knows about.
   Each name here must match a folder in this directory that contains a studio.mjs.

   To add your own brand:
     1. Duplicate the `builders` folder and rename it (lowercase, no spaces), e.g. `acmecorp`.
     2. Add its folder name to the list below.
     3. Open studio/?v=acmecorp

   The FIRST brand in the list is the one the tool opens with by default,
   so put yours first once it is ready. */

export const BRANDS = ['builders'];
