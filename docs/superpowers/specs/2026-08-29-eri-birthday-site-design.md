# Eri's 18th Birthday Site — Design

## Purpose

A one-page, personal gift website for Eri's 18th birthday. It delivers a short birthday message, then a playful "Can we go on a date?" interaction, and ends with her picking a day, time, and activity for the date — which gets emailed to the site owner.

## Tech Stack & Hosting

- Plain HTML, CSS, and vanilla JavaScript. No frameworks, no build tools.
- Hosted on GitHub Pages (owner has a GitHub account).
- Form submissions handled by Formspree (free tier, no backend server needed). Submissions are emailed to `yu.hatta3274@outlook.com`. Requires a one-time Formspree signup and email verification by the owner before the contact form will work; the endpoint ID gets dropped into the JS once available.

## Page Flow

A single page that reveals one full-screen "scene" at a time, with fade/slide transitions between them. No scrolling through all content at once.

1. **Birthday message** — "Happy 18th Birthday, Eri" heading in Great Vibes script, with a personal message below (owner will write the actual text; placeholder copy ships in its place). "Hello" otter GIF (wave + hearts/flowers) animates in on this scene. A "Continue" button advances.
2. **The question** — "Can we go on a date?" with a **Yes** button and a **No** button. The No button dodges to a random on-screen position whenever the cursor approaches or it's tapped (works via both mouse hover and touchstart, so it also dodges on phones). The blushing/laughing otter GIF appears on this scene. Only Yes is functional.
3. **Pick a day** — a custom-built calendar (month view, prev/next navigation, no library). Past dates are disabled. Any current or future date, any month, is selectable.
4. **Pick a time** — after a day is chosen, three options appear: Morning / Afternoon / Evening.
5. **Pick an activity** — Dinner / Movie / Cafe & dessert / Outdoors, plus an "Other" option that reveals a free-text box. A **Confirm** button submits the selections.
6. **Confirmation** — a celebratory "It's a date!" screen. The peeking otter GIF animates in first (as if peeking to see the result), followed by the love+bye otter GIF as a final farewell moment. Behind the scenes, her picks (day, time, activity) are POSTed to Formspree.

## Visual Design

- **Palette:** Champagne Tan, solid (no gradient) background — `#eaddc7`.
- **Headings / name (Great Vibes script):** `#8a6d3b`.
- **Body text (Georgia serif):** `#6b5637`, for readability against the flat background.
- **Otter GIFs:** four existing LINE sticker GIFs (owner-provided, currently sitting at the project root — `Hello Cute Sticker...gif`, `Daily Stickers of Cute Otter_ Animated.gif` [blush/laugh], `LINE 官方貼圖...gif` [peeking], `otter-cute.gif` [love+bye]). These are copyrighted LINE stickers; acceptable here because the site is a private link shared only with Eri, not published as original work or distributed broadly. Files will be copied into an `assets/otters/` folder with clearer names during implementation.
- **Poodle animation:** dropped from scope — replaced by the otter GIFs above.

## Data & Notification Handling

- On Confirm, the site sends `{ day, time, activity }` to Formspree via a background `fetch` request — no page reload; she proceeds straight to the confirmation scene regardless of network timing.
- If the request fails (e.g., no connectivity), the confirmation scene still displays, but her picks are also rendered on-screen as a visible fallback so nothing is silently lost if the email never arrives.
- Formspree free tier caps at 50 submissions/month — more than sufficient for this use case.

## Edge Cases & Testing

- **Mobile-first:** most likely opened on a phone. No-button dodge, calendar, and all buttons must work at phone width and via touch.
- **Touch dodge:** the No button reacts to touchstart proximity, not just mouse hover, since phones have no hover state.
- **Past dates:** disabled in the calendar.
- **Refresh mid-flow:** no persisted state — a refresh simply restarts from the birthday message scene. Acceptable for a site this size.
- **Manual test pass before done:** full click-through of all six scenes at both desktop and mobile viewport widths, one real end-to-end submission verified to arrive by email, and dodge behavior checked with both mouse and touch input.

## Out of Scope

- Photo gallery/timeline.
- Background music.
- Any content beyond the message + date-scheduling flow.
- Persisting her selection anywhere other than the confirmation email.
