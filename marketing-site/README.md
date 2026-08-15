# Potluck marketing site

Static, single-page promotional website for Potluck. It has no JavaScript, registration form, analytics, cookies, or backend.

## Preview locally

From this directory, run any static file server. For example:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy

Use `marketing-site` as the site root. There is no build command; publish the directory as-is.

## Test

```powershell
node --test tests/site.test.mjs
```

Fonts are self-hosted under `assets/fonts` and retain their OFL license files.
