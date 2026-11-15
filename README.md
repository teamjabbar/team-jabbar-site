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
- `functions/api/lead.js`: sends form submissions to MailerLite. The variables it needs are listed at the top of that file.
- `public/images/`: put the logo, team photo and headshots here, then update the paths in `src/site.ts`.

## Run locally
    npm install
    npm run dev
