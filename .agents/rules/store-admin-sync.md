# Store & Admin Portal Synchronization Rule

1. **Parallel Synchronization**: Whenever any modification, redesign, or fix is made to the main website/store (e.g. brand logos, color tokens, typography, product structures, categories, CMS content, pricing, order states), the corresponding parts in the Admin Portal (`admin-portal/`) and `/app/admin` MUST be updated and synchronized in parallel without waiting for the user to request it.
2. **Brand Consistency**: Admin Portal must always reflect the official HORVVALLE Haute Couture visual identity:
   - Official 3D emblem: `/brand/icon-light.png`
   - Official luxury fonts: `EB Garamond`, `Fraunces`, `Instrument Sans`, `Inter`
   - Official color palette: Obsidian `#1A1517` / `#0E0A0B`, Champagne Gold `#D4AF37` / `#E6C280`, Warm Cream `#FAF7F2`
3. **Static Asset Sharing**: Ensure `admin-portal/server.js` maintains static access to the store's public directory (`../public`) so uploaded designs and brand assets always load seamlessly in both places.
