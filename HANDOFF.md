# NEOMED Research Forum — Handoff Guide

This site is built so the **next team can run a new year entirely from the admin
dashboard** — no code changes, no redeploys. Almost every piece of year-specific
text (the year, event date, deadlines, contact email, the "Key Dates" timeline,
the "submissions open/closed" state, and the recap photo gallery) is edited in
the browser and stored in the database.

There are two repositories:

| Repo | What it is | Hosted on |
|------|------------|-----------|
| `forum-app` (this repo) | The website (React + Vite) | Netlify/Vercel/static host |
| `neomed-forum-backend` | The API + database | Railway + MongoDB Atlas |

---

## Rolling the site over to a new year (the 5-minute version)

1. Go to **`/admin`** on the live site and log in.
2. Click the **Settings** tab.
3. Change the values you need and click **Save Changes**:
   - **Year** → e.g. `2027`
   - **Event date / time** → e.g. `February 24, 2027`, `4:00 PM`
   - **Key Dates** → edit/add/remove the timeline rows on the home page
   - **Participant deadlines** → confirm-by, slides-due, review period, decision date
   - **Contact email** → if the organizer changes
   - **Submissions open?** → toggle **on** when you're ready to accept abstracts,
     **off** after the deadline (off shows the "Submissions Closed" banner)
4. In the **Settings → Event Recap Photos** section, delete last year's photos and
   **Upload** the new ones. Add captions if you like.
5. In the **Winners** tab, clear last year's winners and add the new ones after the
   forum (this was already editable before this handoff).

That's it — the public site updates immediately for everyone.

> **Tip:** The very first time settings are opened, the system auto-fills the 2026
> content as a starting point. You're editing from there, not from a blank slate.

---

## One-time setup: Cloudinary (file hosting for photos + PDFs)

Recap photos **and submitted abstract PDFs** are uploaded to **Cloudinary** (a free
file host) so they survive backend redeploys. (Previously PDFs were written to
Railway's local disk, which is wiped on every redeploy — this is now fixed.)
This only needs to be set up once.

1. Create a free account at <https://cloudinary.com>.
2. On the Cloudinary **Dashboard**, copy your `Cloud name`, `API Key`, and `API Secret`.
3. In **Railway** (the backend project) → **Variables**, add:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
4. Redeploy the backend. Photo uploads (admin Settings tab) and abstract PDF
   submissions now work.

> **Important:** once submissions are open, the backend needs these Cloudinary
> vars set, because submitted PDFs are stored there. Set them before you flip
> "Submissions open" on. Recap photos already showing on the site keep working
> regardless.

---

## What each setting controls (where it shows up)

| Setting | Where it appears on the site |
|---------|------------------------------|
| Event name + Year | Navbar, home page title, showcase, all login pages, emails/confirmation copy |
| University | Home page subtitle |
| Event date / time | Home page header, "What happens next" timelines |
| Contact email | Every "Questions? Contact us" link across the site |
| Submissions open? | Whether `/submit` shows the form or the "Submissions Closed" banner |
| Submission deadline | The closed-banner message |
| Key Dates | The "Key Dates" timeline on the home page |
| Confirm-by / Slides-due / Review period / Decision date | The abstract magic-link page participants see |
| Recap photos | The "Event Recap" gallery on the home page |

---

## How it works under the hood (for the next developer)

- **Backend:** a single `Settings` document (a "singleton", `key: "main"`) in MongoDB.
  - `GET /api/settings` — public, returns the settings (auto-seeds defaults on first call).
  - `PUT /api/admin/settings` — admin-only, updates whitelisted fields.
  - `POST /api/admin/settings/recap-photo` — admin-only, uploads an image to Cloudinary.
  - `DELETE /api/admin/settings/recap-photo` — admin-only, removes a photo.
  - Files: `models/Settings.js`, `controllers/settingsController.js`,
    `routes/settings.js`, and the settings lines in `routes/admin.js`.
- **Frontend:** `src/context/SettingsContext.jsx` fetches the settings once on load
  and shares them with every page via the `useSettings()` hook. It ships with
  **fallback defaults**, so if the API is ever down the site still renders sensible
  content instead of blank spaces.
  - Pages read values like `settings.year`, `settings.eventDate`, etc.
  - The admin editor is `src/components/SettingsAdminTab.jsx` (the **Settings** tab).

### Adding a new editable field
1. Add it to the schema in `models/Settings.js` **and** to `DEFAULT_SETTINGS` +
   `EDITABLE_FIELDS` in `controllers/settingsController.js`.
2. Add it to `DEFAULT_SETTINGS` in `src/context/SettingsContext.jsx`.
3. Add an input for it in `src/components/SettingsAdminTab.jsx`.
4. Use `settings.yourField` wherever it should appear.

---

## Local development

**Backend** (`neomed-forum-backend/neomed-backend`):
```bash
npm install
# needs a local MongoDB running, or point MONGODB_URI at Atlas in .env
npm run dev
```

**Frontend** (`forum-app`):
```bash
npm install
# .env → VITE_API_URL points at your backend (local or the Railway URL)
npm run dev      # http://localhost:5173
npm run build    # production build
```

---

## Notes / gotchas

- **`src/pages/SubmitPage.jsx` is dead code** — the live submit flow is
  `MultiStepSubmitPage.jsx`. Safe to ignore or delete.
- Dates are plain text (e.g. `"February 24, 2027"`), typed exactly as they should
  appear. There's no date picker — this is intentional so the wording stays flexible.
- The "Submissions open?" toggle is the switch that used to be a hardcoded
  `SUBMISSIONS_CLOSED` constant in the code. It's now in the Settings tab.
