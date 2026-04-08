import { documentToPlainTextString } from "@contentful/rich-text-plain-text-renderer";
import type { Document } from "@contentful/rich-text-types";
import type { Entry } from "contentful";

import type { ArticleSkeleton } from "@/types/contentful";

function isRichTextDocument(value: unknown): value is Document {
  return Boolean(
    value &&
      typeof value === "object" &&
      "nodeType" in value &&
      "content" in value &&
      "data" in value
  );
}

export function getContentfulAssetUrl(asset: unknown) {
  if (
    asset &&
    typeof asset === "object" &&
    "fields" in asset &&
    (asset as { fields?: { file?: { url?: string } } }).fields?.file?.url
  ) {
    return `https:${(asset as { fields: { file: { url: string } } }).fields.file.url}`;
  }

  return null;
}

export function formatLongDate(dateStr?: string) {
  if (!dateStr) return null;

  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(dateStr?: string) {
  if (!dateStr) return null;

  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function truncateText(text: string, maxLength: number, minTrimPoint = 80) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;

  const truncated = normalized.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return `${(lastSpace > minTrimPoint ? truncated.slice(0, lastSpace) : truncated).trim()}...`;
}

export function getArticleExcerpt(
  article: Entry<ArticleSkeleton>,
  maxLength = 145,
  fallback = "Read the full article for the latest BSAVA news and insights."
) {
  const body = article.fields.body;

  if (!isRichTextDocument(body)) {
    return fallback;
  }

  const plainText = documentToPlainTextString(body).replace(/\s+/g, " ").trim();

  if (!plainText) {
    return fallback;
  }

  return truncateText(plainText, maxLength);
}
