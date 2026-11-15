# Team Jabbar website

Astro site for teamjabbar.com, hosted on Cloudflare Pages.

## Cloudflare Pages settings
- Framework preset: Astro
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `NODE_VERSION` = `22`

## Where things are
- `src/site.ts`: phone, email, brokerage, team bios and photos. Edit here and every page updates.
- `src/pages/`: one file per page.
- `src/components/LeadForm.astro`: the form used on every page.
- `functions/api/lead.js`: sends form submissions to MailerLite. It needs one Cloudflare secret, `MAILERLITE_API_KEY`. Never put the key in this repo.
- `public/images/`: put the logo, team photo and headshots here, then update the paths in `src/site.ts`.

## Run locally
    npm install
    npm run dev

## Adding a pre-construction project
Add one file per project in `src/content/projects/` (copy an existing one). Images can be web addresses from the
builder's site: every build copies them onto this site and resizes them (`scripts/fetch-assets.mjs`). Set `draft: false` to publish.
The homepage section and the directory appear automatically once at least one project is published.
Only add projects the builder has authorized the team to market, and keep the builder's name on the page.
To preview drafts locally: `SHOW_DRAFTS=1 npm run build && npm run preview`.
