import Link from "next/link";
import type { ReactNode } from "react";

import { SurfaceCard } from "./PagePrimitives";

export default function EditorialCard({
  href,
  title,
  excerpt,
  imageUrl,
  imageAlt,
  primaryMeta,
  secondaryMeta,
  ctaLabel = "Read article",
}: {
  href: string;
  title: ReactNode;
  excerpt: ReactNode;
  imageUrl?: string | null;
  imageAlt?: string;
  primaryMeta?: string | null;
  secondaryMeta?: string | null;
  ctaLabel?: string;
}) {
  return (
    <Link href={href} className="group block w-full max-w-[300px] justify-self-center">
      <SurfaceCard className="flex h-full w-full flex-col pb-[30px] transition-transform duration-200 group-hover:-translate-y-0.5">
        <div className="relative h-[214px] w-full overflow-hidden bg-black/5">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={imageAlt || "Article image"}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 text-[36px] font-black uppercase tracking-[0.14em] text-black/20">
              BSAVA
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-[13px] px-[20px] pt-[24px]">
          <h3 className="min-h-[72px] line-clamp-3 font-inter text-[16px] font-extrabold leading-[1.5] text-[#1d1c1d] [&_mark]:bg-[#f6eb72] [&_mark]:px-[1px] [&_mark]:text-inherit">
            {title}
          </h3>

          <p className="min-h-[84px] line-clamp-4 font-inter text-[14px] leading-[1.5] text-[#1d1c1d] [&_mark]:bg-[#f6eb72] [&_mark]:px-[1px] [&_mark]:text-inherit">
            {excerpt}
          </p>

          <div className="mt-auto flex flex-col gap-[4px]">
            {primaryMeta ? (
              <span className="font-inter text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6c6c6c]">
                {primaryMeta}
              </span>
            ) : null}
            {secondaryMeta ? (
              <span className="font-inter text-[14px] leading-[1.5] text-[#333333]">{secondaryMeta}</span>
            ) : null}
          </div>

          <span className="mt-1 inline-flex items-center gap-[6px] font-inter text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1d1c1d]">
            {ctaLabel}
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </SurfaceCard>
    </Link>
  );
}
