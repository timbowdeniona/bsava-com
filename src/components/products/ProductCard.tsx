"use client";

import type { CSSProperties } from "react";

import { useCart } from "@/lib/store/useCart";
import { getPimcoreImageUrl } from "@/lib/images";
import type { PimcoreProduct } from "@/types/pimcore";

interface ProductCardProps {
  product: PimcoreProduct;
}

const formatPrice = (price?: number) => {
  if (price === undefined || price === null) return "£TBC";
  if (price === 0) return "£FREE";
  return `£${price.toFixed(2)}`;
};

const getBadgeLabel = (product: PimcoreProduct) => {
  switch (product.productType) {
    case "Book":
      return "Printed book";
    case "EBook":
      return /pdf/i.test(product.title) ? "PDF" : "eBook";
    case "Event":
      return "Event";
    case "Course":
      return /podcast/i.test(product.title) ? "Podcast" : "Webinar";
    case "Membership":
      return "Membership";
    default:
      return product.productType;
  }
};

const getSecondaryBadge = (product: PimcoreProduct) => {
  if (product.productType === "Book" && /edition/i.test(product.title)) {
    return "New edition";
  }

  return null;
};

const getExcerpt = (product: PimcoreProduct) => {
  const plainText = product.description?.replace(/\s+/g, " ").trim();

  if (!plainText) {
    if (product.productType === "Event") {
      return "Join BSAVA for this professional event and access expert-led clinical content.";
    }

    if (product.productType === "Course") {
      return "Advance your skills with BSAVA learning content and practical clinical guidance.";
    }

    return "Explore this BSAVA resource in the full products catalogue.";
  }

  const maxLength = 118;
  if (plainText.length <= maxLength) {
    return plainText;
  }

  const truncated = plainText.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return `${(lastSpace > 70 ? truncated.slice(0, lastSpace) : truncated).trim()}...`;
};

const formatPublicationDate = (publicationDate?: string) => {
  if (!publicationDate) return null;

  const normalized = publicationDate.includes(" ") ? publicationDate.replace(" ", "T") : publicationDate;
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return /^\d{4}$/.test(publicationDate) ? publicationDate : null;
  }

  return parsed.toLocaleDateString("en-GB", {
    month: "2-digit",
    year: "2-digit",
  });
};

const formatMeta = (product: PimcoreProduct) => {
  if (product.productType === "Book" || product.productType === "EBook") {
    const published = formatPublicationDate(product.publicationDate);
    return published ? `Published: ${published}` : null;
  }

  if (product.productType === "Event" && product.startDate) {
    const parsed = new Date(product.startDate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    }
  }

  return null;
};

function CardBadge({
  primary,
  secondary,
}: {
  primary: string;
  secondary?: string | null;
}) {
  return (
    <div className="absolute bottom-0 left-0 z-20 flex items-center gap-[2px]">
      <span
        className={`bg-white px-[10px] py-[5px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-[#1d1c1d] ${secondary ? '' : 'rounded-tr-[4px]'}`}
      >
        {primary}
      </span>
      {secondary ? (
        <span className="rounded-tr-[4px] bg-white px-[10px] py-[5px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-[#1d1c1d]">
          {secondary}
        </span>
      ) : null}
    </div>
  );
}

function CoverMedia({
  product,
  imageUrl,
}: {
  product: PimcoreProduct;
  imageUrl: string | null;
}) {
  const secondaryBadge = getSecondaryBadge(product);
  const isDigital = product.productType === "EBook";
  const rotation = isDigital ? "-rotate-[10deg]" : "-rotate-[8deg]";
  const coverPositionClasses = isDigital
    ? "left-[49px] top-[22px]"
    : "left-1/2 top-[30px] -translate-x-1/2";
  const shadowPositionClasses = isDigital
    ? "left-[62px] top-[30px]"
    : "left-1/2 top-[38px] -translate-x-1/2 translate-x-[10px]";

  return (
    <div className="relative h-[300px] overflow-hidden bg-[#eeeeee]">
      <CardBadge primary={getBadgeLabel(product)} secondary={secondaryBadge} />

      {isDigital ? (
        <div className={`absolute h-[232px] w-[164px] ${shadowPositionClasses}`}>
          <div className="h-full w-full -rotate-[3deg] bg-black/10" />
        </div>
      ) : null}

      <div className={`absolute h-[232px] w-[164px] ${coverPositionClasses}`}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.title}
            className={`h-full w-full object-cover shadow-[0px_8px_20px_rgba(0,0,0,0.18)] ${rotation}`}
          />
        ) : (
          <div
            className={`flex h-full w-full flex-col items-center justify-center bg-white text-center shadow-[0px_8px_20px_rgba(0,0,0,0.12)] ${rotation}`}
          >
            <span className="font-bsava-display text-[22px] leading-[0.95] tracking-[-0.05em] text-[#1d1c1d]">
              BSAVA
            </span>
            <span className="mt-3 px-4 font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1d1c1d]/55">
              {getBadgeLabel(product)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function LearningMedia({ product }: { product: PimcoreProduct }) {
  const isPodcast = /podcast/i.test(product.title);

  return (
    <div className="relative h-[300px] overflow-hidden bg-[#a8adb0]">
      <CardBadge primary={getBadgeLabel(product)} />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0.22)_100%)]" />
      <div className="absolute inset-[18px] border border-white/35 bg-white/10" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-black/35">
          <div
            className="h-0 w-0 border-y-[13px] border-y-transparent border-l-[20px] border-l-white"
            style={{ marginLeft: isPodcast ? 0 : 4 }}
          />
        </div>
        <div className="max-w-[220px] font-inter text-[18px] font-semibold leading-[1.35] text-white">
          {isPodcast ? "On-demand audio learning" : "Self-paced clinical learning"}
        </div>
      </div>
    </div>
  );
}

function EventMedia({ product }: { product: PimcoreProduct }) {
  return (
    <div className="relative h-[300px] overflow-hidden bg-[#1a1617]">
      <div className="absolute inset-x-0 top-0 h-[46px] bg-[#e32726]" />
      <CardBadge primary={getBadgeLabel(product)} />

      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-8 pt-16 text-white">
        <div className="mb-3 font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-white/75">
          {product.location || "BSAVA Event"}
        </div>
        <div className="max-w-[220px] font-inter text-[32px] font-extrabold leading-[0.95] tracking-[-0.04em]">
          {product.title.split(":")[0]}
        </div>
      </div>
    </div>
  );
}

function MembershipMedia() {
  return (
    <div className="relative h-[300px] overflow-hidden bg-[#3ba6da]">
      <CardBadge primary="Membership" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.35),transparent_40%),linear-gradient(135deg,rgba(0,0,0,0.06),transparent_55%)]" />
      <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
        <span className="font-bsava-display text-[54px] leading-[0.9] tracking-[-0.07em] text-white">
          BSAVA
        </span>
      </div>
    </div>
  );
}

function renderMedia(product: PimcoreProduct, imageUrl: string | null) {
  switch (product.productType) {
    case "Book":
    case "EBook":
      return <CoverMedia product={product} imageUrl={imageUrl} />;
    case "Event":
      return <EventMedia product={product} />;
    case "Course":
      return <LearningMedia product={product} />;
    case "Membership":
      return <MembershipMedia />;
    default:
      return <CoverMedia product={product} imageUrl={imageUrl} />;
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const imageUrl = getPimcoreImageUrl(product.mainImage?.fullpath);
  const meta = formatMeta(product);
  const excerpt = getExcerpt(product);

  const cardStyle: CSSProperties | undefined =
    product.productType === "Membership"
      ? {
          minHeight: 0,
        }
      : undefined;

  return (
    <article
      className="justify-self-center overflow-hidden rounded-[2px] flex h-full w-full max-w-[300px] flex-col gap-[30px] bg-white pb-[30px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)]"
      style={cardStyle}
    >
      {renderMedia(product, imageUrl)}

      <div className="flex flex-1 flex-col gap-[13px] px-[20px]">
        <h3 className="min-h-[48px] font-inter text-[16px] font-extrabold leading-[1.5] text-[#1d1c1d]">
          {product.title}
        </h3>

        <p className="min-h-[63px] font-inter text-[14px] leading-[1.5] text-[#1d1c1d]">
          {excerpt}
        </p>

        <div className="flex flex-col gap-[5px]">
          <div className="flex w-full items-center gap-[20px] border-y border-[#e5e5e5] py-[5px]">
            <div className="flex min-w-[79px] flex-col items-start">
              <div className="font-inter text-[14px] leading-[1.5] text-[#1d1c1d]">Non-members:</div>
              <div className="font-inter text-[14px] font-semibold leading-[1.5] text-[#1d1c1d]">
                {formatPrice(product.nonMemberPrice)}
              </div>
            </div>

            <div className="flex min-w-[79px] flex-col items-start">
              <div className="font-inter text-[14px] leading-[1.5] text-[#1d1c1d]">Members:</div>
              <div className="font-inter text-[14px] font-semibold leading-[1.5] text-[#1d1c1d]">
                {formatPrice(product.memberPrice)}
              </div>
            </div>
          </div>

          <div className="min-h-[21px] font-inter text-[14px] leading-[1.5] text-[#747474]">
            {meta ?? ""}
          </div>
        </div>

        <button
          type="button"
          onClick={() => addItem(product)}
          className="mt-auto inline-flex w-fit items-center justify-center bg-[#1d1c1d] px-[20px] py-[15px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-white transition-colors hover:bg-black"
        >
          More details
        </button>
      </div>
    </article>
  );
}
