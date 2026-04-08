import Link from "next/link";
import type { ReactNode } from "react";

const NEWS_PANEL_CTA_ARROW_URL = "/figma/news-panel-cta-arrow.svg";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export default function NewsInsightCard({
  href,
  title,
  excerpt,
  imageUrl,
  imageAlt,
  dateText,
  className,
  titleClassName,
  excerptClassName,
}: {
  href: string;
  title: ReactNode;
  excerpt: ReactNode;
  imageUrl?: string | null;
  imageAlt?: string;
  dateText?: string | null;
  className?: string;
  titleClassName?: string;
  excerptClassName?: string;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "group flex w-full max-w-[408px] flex-col overflow-hidden bg-white pb-[30px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] transition-transform duration-200 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="relative h-[214px] w-full overflow-hidden bg-white">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={imageAlt || ""}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 text-[40px] font-black uppercase tracking-[0.12em] text-black/25">
            BSAVA
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-[13px] px-[24px] pt-[24px]">
        <h3 className={cx("font-inter text-[16px] font-extrabold leading-[1.5] text-black", titleClassName)}>
          {title}
        </h3>

        <div className={cx("font-inter text-[14px] font-normal leading-[1.5] text-black/85", excerptClassName)}>
          {excerpt}
        </div>

        <div className="mt-auto flex flex-col gap-[13px] pt-1">
          {dateText ? (
            <span className="font-inter text-[14px] leading-[1.5] text-[#333333]">{dateText}</span>
          ) : null}

          <span className="inline-flex items-center gap-[5px] font-inter text-[14px] font-extrabold leading-[1.5] text-[#22155f]">
            Read article
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={NEWS_PANEL_CTA_ARROW_URL}
              alt=""
              aria-hidden="true"
              className="h-[10px] w-[8px] shrink-0"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
