# Power Express — Content Manager (CMS)

A standalone admin web app for editing the content of **powerexpress1980.com**
without touching the website code. It reads and writes the same Supabase
tables the team already edits in the Supabase Table Editor — both editing
methods work side by side.

- **CMS URL:** https://skubacool.github.io/pex-cms/
- **Website:** https://powerexpress1980.com
- **Supabase project:** https://supabase.com/dashboard/project/yttnuerixoafmhpdghdm
- **Editing guide for the team:** see [ADMIN-GUIDE.md](ADMIN-GUIDE.md)

## How it fits together

```
                       ┌──────────────────────────┐
  Team (table editor) ─►                          │
                       │   Supabase tables        ├─ edge functions ─► live website
  Team (this CMS)     ─►   + "pex" image bucket   │   (read only)
                       └──────────────────────────┘
```

The website reads through Supabase Edge Functions; the CMS and the Table
Editor write directly to the tables. A change saved in either place is live
on the website immediately (visitors see it on next page load).

Content sections: Hero Banners, Projects, News & Activities, Activity
Tags/Types, Benefits, Partners & Clients, Contact Channels, Site Text
(localization), Site Images (media).

## One-time Supabase setup (REQUIRED before the CMS can save)

1. Open the [SQL Editor](https://supabase.com/dashboard/project/yttnuerixoafmhpdghdm/sql/new)
   and run the contents of [`supabase/admin-setup.sql`](supabase/admin-setup.sql).
   This makes the database **read-only for the public** and grants edit
   rights to signed-in CMS users. It does not modify any data, and the
   Table Editor keeps working as before.
2. In the dashboard: **Authentication → Sign In / Up →** disable
   **"Allow new users to sign up"**.
3. **Authentication → Users → Add user** — create an email + password for
   each team member (tick **Auto Confirm User**).
4. Verify the live website still shows all content (it will — public
   reading stays allowed — but check anyway).

If anything looks wrong, run [`supabase/rollback.sql`](supabase/rollback.sql)
to restore the previous behavior exactly.

> **Why this matters:** before this setup, *anyone* on the internet holding
> the public API key (visible in the website source) could write to the
> database. After it, only signed-in CMS users can.

## Local development

```bash
npm install
npm run dev        # http://localhost:5174
```

## Deploying updates to the CMS

```bash
npm run deploy     # builds and pushes to the gh-pages branch
```

The app is plain Vite + React + TypeScript. All content configuration
(tables, fields, labels) lives in [`src/config.ts`](src/config.ts) — to add
a field or section, edit the `TABLES` array there.

## Notes

- The Supabase **publishable** key in `src/config.ts` is safe to commit —
  it is already public in the live website's source.
- Images upload to the public `pex` bucket under `cms/<table>/…` with
  timestamped names (no overwriting, no CDN cache issues).
- `key` columns (Site Text, Site Images, Contact type) are locked when
  editing existing rows because the website looks content up by them.
