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

## Show Multiple Articles on Homepage

If the homepage shows only one article, update Blogger's post count setting:

1. Open Blogger.
2. Go to `Settings`.
3. Find `Posts`.
4. Set `Max posts shown on main page` to `6`, `9`, or `12`.
5. Save and refresh the homepage.

The theme uses a two-column card grid on desktop and one column on mobile.

If Blogger still shows only one post even after this setting, it is usually Blogger auto-pagination. This happens when recent posts are heavy because Blogger reduces the server-rendered homepage payload. The theme includes a JSON feed fallback that loads recent posts from `/feeds/posts/default` on the homepage and older post pages.

For that fallback to work:

1. Open Blogger.
2. Go to `Settings`.
3. Find `Site feed`.
4. Set `Allow blog feed` to `Full`.
5. Save, then refresh the homepage.

Use `Full` feed when you want thumbnail images on the homepage cards, because the theme extracts the first image from each post body when Blogger does not expose `media$thumbnail`.

For the best SEO result, posts should contain a Blogger jump break (`<!--more-->`). The current VPS bot and local HTML generator add this automatically for future posts. To patch existing published posts, run this from the project root:

```bash
cd vps-bot
npm run migrate-jump-breaks
npm run migrate-jump-breaks -- --apply
```

The first command is a dry run. The second command updates live Blogger posts that do not already have a jump break.

## Search Console Notes

- Main article URLs should stay indexable.
- Label, search, archive, and older/newer pagination URLs are intentionally set to `noindex,follow` by the theme to reduce duplicate URL noise.
- `Alternate page with proper canonical tag` is usually expected when Google chooses the main canonical URL.
- `Duplicate without user-selected canonical` should reduce after jump breaks, canonical tags, and noindex pagination are live.
- `Redirect error` needs the sample URLs from Search Console before a precise fix can be made.
- Submit `https://editorialvocab.in/sitemap.xml` in Search Console and use URL Inspection for important new posts.

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
