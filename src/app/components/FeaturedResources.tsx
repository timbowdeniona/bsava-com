import Link from "next/link";

import { getPimcoreImageUrl } from "@/lib/images";
import { getProducts } from "@/lib/pimcore";
import type { PimcoreProduct } from "@/types/pimcore";

const FEATURED_RESOURCES_MARK_URL = "/figma/featured-resources-mark.svg";
const FEATURED_RESOURCES_CTA_ARROW_URL = "/figma/featured-resources-cta-arrow.svg";

const CARD_MEDIA_STYLES = [
  {
    shadow: { top: 5, left: "calc(50% + 7px)", transform: "translateX(-50%) rotate(-4deg)" },
    cover: { top: -6, left: "calc(50% - 3px)", transform: "translateX(-50%) rotate(-10deg)" },
  },
  {
    shadow: { top: 2, left: "calc(50% + 5px)", transform: "translateX(-50%) rotate(-3deg)" },
    cover: { top: -10, left: "50%", transform: "translateX(-50%) rotate(-10deg)" },
  },
  {
    shadow: { top: 3, left: "calc(50% + 6px)", transform: "translateX(-50%) rotate(-3deg)" },
    cover: { top: -8, left: "50%", transform: "translateX(-50%) rotate(-10deg)" },
  },
] as const;

const getExcerpt = (description?: string) => {
  const plainText = description?.replace(/\s+/g, " ").trim();

  if (!plainText) {
    return "Explore this BSAVA resource in the full products catalogue.";
  }

  const maxLength = 135;
  if (plainText.length <= maxLength) {
    return plainText;
  }

  const truncated = plainText.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return `${(lastSpace > 85 ? truncated.slice(0, lastSpace) : truncated).trim()}...`;
};

const formatResourceDate = (product: PimcoreProduct) => {
  const rawDate = product.publicationDate || product.startDate;
  if (!rawDate) return null;

  const normalizedDate = rawDate.includes(" ") ? rawDate.replace(" ", "T") : rawDate;
  const date = new Date(normalizedDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-GB", {
    month: "2-digit",
    year: "2-digit",
  });
};

const shouldShowGuideBadge = (product: PimcoreProduct) => /guide/i.test(product.title);

function ResourceCardMedia({
  product,
  imageUrl,
  index,
}: {
  product: PimcoreProduct;
  imageUrl: string | null;
  index: number;
}) {
  const mediaStyle = CARD_MEDIA_STYLES[index] || CARD_MEDIA_STYLES[CARD_MEDIA_STYLES.length - 1];

  return (
    <div className="relative h-[214px] w-full overflow-hidden bg-[#97d5eb]">
      {shouldShowGuideBadge(product) && (
        <span className="absolute left-0 top-[186px] z-20 rounded-tr-[4px] bg-white px-[10px] py-[5px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-[#1d1c1d]">
          New guide
        </span>
      )}

      <div
        className="absolute z-0 h-[203px] w-[150px] bg-black/30 shadow-[0px_6px_20px_rgba(0,0,0,0.18)]"
        style={mediaStyle.shadow}
        aria-hidden="true"
      />

      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={product.title}
            className="absolute z-10 h-[203px] w-[150px] object-cover shadow-[0px_8px_20px_rgba(0,0,0,0.18)]"
            style={mediaStyle.cover}
          />
        </>
      ) : (
        <div
          className="absolute z-10 flex h-[203px] w-[150px] flex-col items-center justify-center bg-white px-4 text-center text-[#22155f] shadow-[0px_8px_20px_rgba(0,0,0,0.18)]"
          style={mediaStyle.cover}
        >
          <span className="font-bsava-display text-[20px] leading-[0.95] tracking-[-0.04em]">BSAVA</span>
          <span className="mt-3 font-inter text-[12px] font-semibold uppercase tracking-[0.08em] text-[#22155f]/80">
            {product.productType}
          </span>
        </div>
      )}
    </div>
  );
}

export default async function FeaturedResources() {
  const products = await getProducts(3).catch(() => []);

  return (
    <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#8232a7]">
      <div className="mx-auto flex max-w-[1372px] flex-col gap-8 px-6 py-10 md:px-10 md:py-12 lg:gap-[38px] lg:px-10 lg:py-[40px]">
        <div className="flex items-center gap-[14px] md:gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FEATURED_RESOURCES_MARK_URL}
            alt=""
            aria-hidden="true"
            className="h-[31px] w-[26px] shrink-0 md:h-[39.18px] md:w-[33.6px]"
          />
          <h2 className="font-bsava-display text-[28px] leading-[1.05] tracking-[-0.05em] text-white md:text-[32px] lg:text-[36px]">
            Featured resources
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="w-full border-2 border-dashed border-white/35 bg-white/10 px-8 py-12 text-center font-inter italic text-white/80">
            No featured resources found in Pimcore Data Hub.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-stretch lg:justify-between lg:gap-[34px]">
            {products.map((product, index) => {
              const imageUrl = getPimcoreImageUrl(product.mainImage?.fullpath);
              const excerpt = getExcerpt(product.description);
              const date = formatResourceDate(product);

              return (
                <Link
                  key={`${product.id}-${product.productType}`}
                  href="/products"
                  className="group flex w-full max-w-[408px] flex-col overflow-hidden bg-white pb-[30px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <ResourceCardMedia product={product} imageUrl={imageUrl} index={index} />

                  <div className="flex flex-1 flex-col gap-[13px] px-[17px] pt-[24px] md:px-[24px]">
                    <h3 className="min-h-[72px] font-inter text-[16px] font-extrabold leading-[1.45] text-black">
                      {product.title}
                    </h3>

                    <p className="min-h-[64px] font-inter text-[14px] leading-[1.5] text-black/85">
                      {excerpt}
                    </p>

                    <div className="mt-auto flex flex-col gap-[10px] pt-[2px]">
                      <span className="min-h-[21px] font-inter text-[14px] leading-[1.5] text-[#333333]">
                        {date}
                      </span>

                      <span className="inline-flex items-center gap-[5px] font-inter text-[14px] font-extrabold leading-[1.5] text-[#22155f]">
                        Read more
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={FEATURED_RESOURCES_CTA_ARROW_URL}
                          alt=""
                          aria-hidden="true"
                          className="h-[10px] w-[8px] shrink-0"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
