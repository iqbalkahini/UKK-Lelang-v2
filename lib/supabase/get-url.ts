export function getURL(path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (typeof window !== "undefined") {
    return `${window.location.origin}${normalizedPath}`;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    "http://localhost:3000";

  const baseUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;

  return `${baseUrl.replace(/\/$/, "")}${normalizedPath}`;
}
