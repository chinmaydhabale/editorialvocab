# Blogger Theme For Automated EditorialVocab Site

This folder contains the Blogger shell for an automation-first Daily Editorial Vocabulary website.

## Files

- `editorial-vocab-2026-theme.xml`: Current Blogger XML theme.
- `pages/about-us.html`: Static About page.
- `pages/privacy-policy.html`: Static Privacy Policy page.
- `pages/disclaimer.html`: Static Disclaimer page.
- `pages/contact-us.html`: Static Contact page.
- `pages/terms-and-conditions.html`: Static Terms page.

## Automation Contract

The React bot publishes complete Blogger post bodies with:

- Featured thumbnail image.
- SEO title banner.
- Intro callout.
- Vocabulary cards.
- Optional idioms and phrases section.
- Revision footer.

Because each post body is self-contained, the Blogger theme intentionally stays minimal:

- Header navigation.
- Homepage hero.
- Search and auto-label browse panel.
- Latest lesson feed.
- Legal/footer links.

## Auto Labels

The bot now publishes labels that this theme uses for navigation:

- `Vocabulary`
- `Idioms` when the post contains idioms.
- Month label such as `January`, `February`, `July`.
- Newspaper/source label such as `The Hindu`, `Indian Express`, `LiveMint`, `Business Standard`, or `Times of India`.

Do not manually depend on old exam labels such as `UPSC`, `Banking`, `SSC`, or `CLAT` unless the bot is changed to publish them.

## Install Theme

1. Open Blogger.
2. Go to `Theme`.
3. Click the arrow next to `Customize`.
4. Choose `Restore`.
5. Upload `editorial-vocab-2026-theme.xml`.
6. Open one homepage, one post page, and one static page to verify layout.

## Create Static Pages

In Blogger, open `Pages`, create each page below, switch to HTML view, paste the matching file contents, and publish.

- `About Us`: `pages/about-us.html`
- `Privacy Policy`: `pages/privacy-policy.html`
- `Disclaimer`: `pages/disclaimer.html`
- `Contact Us`: `pages/contact-us.html`
- `Terms and Conditions`: `pages/terms-and-conditions.html`

The theme links these pages from the footer:

- `/p/about-us.html`
- `/p/privacy-policy.html`
- `/p/disclaimer.html`
- `/p/contact-us.html`
- `/p/terms-and-conditions.html`
