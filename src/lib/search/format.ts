import type { Creation } from "#lib/api.ts";

export function formatCount(n: number | undefined | null): string {
  const v = n ?? 0;
  if (v >= 10000) return (v / 10000).toFixed(1).replace(/\.0$/, "") + "w";
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(v);
}

export function formatDate(ts: number | undefined | null): string {
  if (!ts) return "---";
  return new Date(ts).toLocaleDateString();
}

export function formatCover(cre: Creation.Creation): string {
  if (cre.creationRelease.coverGifLink) {
    return cre.creationRelease.coverGifLink;
  }
  if (cre.featuredCoverLink && cre.featuredCoverLink.startsWith("http")) {
    return cre.featuredCoverLink;
  }
  return cre.latestCoverLink;
}
