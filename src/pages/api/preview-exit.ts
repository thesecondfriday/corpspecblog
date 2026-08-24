import type { APIRoute } from "astro";

export const prerender = false;

/** Leaves draft preview and returns to the published page. */
export const GET: APIRoute = ({ url, cookies, redirect }) => {
  cookies.delete("__preview", { path: "/" });

  const back = url.searchParams.get("to");
  const safe = back && back.startsWith("/") ? back : "/blog";
  return redirect(safe, 307);
};
