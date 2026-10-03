import { SITE } from "../data/nav.js";

/**
 * Page metadata. React 19 hoists <title>, <meta> and <link> rendered anywhere in
 * the tree into <head>, so this costs one component and no effect bookkeeping.
 */
export function Seo({ title, description, path = "/", jsonLd }) {
  const url = `${SITE.url}${path === "/" ? "" : path}`;
  const full = title ? `${title} · ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;

  return (
    <>
      <title>{full}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE.url}/shots/opentwit-web/thumbs/phone-home-for-you.jpg`} />
      <meta name="twitter:card" content="summary_large_image" />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </>
  );
}