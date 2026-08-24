import type { APIRoute } from "astro";

export const prerender = false;

/*
 * Enters draft preview.
 *
 *   /api/preview?secret=…&slug=/blog/gifting-guides/some-post
 *
 * Sets an httpOnly cookie and redirects to the preview route. The cookie is
 * what the preview pages check — the secret never travels further than this
 * handler, and never reaches the browser.
 *
 * Point Sanity's Presentation tool (or a plain bookmark) at this URL.
 */
export const GET: APIRoute = ({ url, cookies, redirect }) => {
  const secret = import.meta.env.PREVIEW_SECRET;
  if (!secret) {
    return new Response("Preview is not configured: PREVIEW_SECRET is unset.", { status: 501 });
  }

  if (url.searchParams.get("secret") !== secret) {
    // Deliberately terse — this endpoint is public, so it says nothing about
    // whether the secret exists or merely didn't match.
    return new Response("Not authorised.", { status: 401 });
  }

  const slug = url.searchParams.get("slug");
  if (!slug) return new Response("Missing ?slug=", { status: 400 });

  // Only ever redirect within this site: an open redirect here would be a
  // phishing primitive attached to a trusted domain.
  if (!slug.startsWith("/")) return new Response("slug must be a path starting with /", { status: 400 });

  cookies.set("__preview", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    path: "/",
    maxAge: 60 * 60, // An hour is long enough to review; short enough to expire.
  });

  // Strip /blog so /blog/cat/slug and /preview/cat/slug stay in step.
  const target = slug.replace(/^\/blog/, "");
  return redirect(`/preview${target}`, 307);
};
