# Eri's 18th Birthday Site

## Before sharing the link

1. **Write your message.** Open `index.html`, find the `<p class="message">` inside `scene-message`, and replace the placeholder text with your own.
2. **Set up Formspree** (so her picks get emailed to you):
   - Sign up free at https://formspree.io using yu.hatta3274@outlook.com.
   - Create a new form, verify the email when Formspree sends the confirmation.
   - Copy the form endpoint (looks like `https://formspree.io/f/abcdwxyz`).
   - Open `js/app.js` and replace `FORMSPREE_ENDPOINT`'s placeholder value with your real endpoint.
3. **Test locally** before deploying:
   ```bash
   npx serve .
   ```
   (or `python -m http.server` if you have Python installed)

   Open the printed local URL and click through the whole flow, including a real Confirm submission — check that the email arrives.

## Deploying to GitHub Pages

1. Create a new GitHub repository and push this project to it:
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. On GitHub, go to the repo's **Settings → Pages**.
3. Under "Build and deployment", set **Source** to "Deploy from a branch", branch `main`, folder `/ (root)`.
4. Save. GitHub will give you a URL like `https://<username>.github.io/<repo>/` within a minute or two — that's the link to send Eri.

## Local development

- No build step. Just serve the folder with any static server (`npx serve .`, `python -m http.server`, VS Code Live Server, etc.) — opening `index.html` directly via `file://` won't work because ES modules require HTTP.
- Run unit tests with `npm test`.
