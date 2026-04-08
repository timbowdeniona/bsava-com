import Link from "next/link";
import type { ReactNode } from "react";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx("mx-auto max-w-[1372px] px-6 md:px-10", className)}>{children}</div>;
}

export function PageHero({
  title,
  description,
  eyebrow,
  children,
  className,
  centered = false,
}: {
  title: string;
  description?: string | null;
  eyebrow?: string;
  children?: ReactNode;
  className?: string;
  centered?: boolean;
}) {
  return (
    <section className={cx("bg-white py-10 md:py-12", className)}>
      <PageContainer>
        <div
          className={cx(
            "flex flex-col gap-5",
            centered ? "items-center text-center" : "items-start text-left"
          )}
        >
          {eyebrow ? (
            <span className="font-inter text-[12px] font-semibold uppercase tracking-[0.18em] text-[#747474]">
              {eyebrow}
            </span>
          ) : null}
          <div className={cx("flex flex-col gap-4", centered ? "max-w-[840px]" : "max-w-[920px]")}>
            <h1 className="font-bsava-display text-[34px] leading-[1.02] tracking-[-0.05em] text-[#1d1c1d] md:text-[42px] lg:text-[48px]">
              {title}
            </h1>
            {description ? (
              <p className="font-inter text-[18px] leading-[1.5] text-[#4d4d4d] md:text-[20px]">
                {description}
              </p>
            ) : null}
          </div>
          {children}
        </div>
      </PageContainer>
    </section>
  );
}

export function SectionHeading({
  title,
  description,
  className,
}: {
  title: string;
  description?: string | null;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <h2 className="font-bsava-display text-[28px] leading-[1.05] tracking-[-0.05em] text-[#1d1c1d] md:text-[32px] lg:text-[36px]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-[760px] font-inter text-[16px] leading-[1.55] text-[#5d5d5d] md:text-[18px]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function SurfaceCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-[2px] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.12)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageBackLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-inter text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1d1c1d] transition-opacity hover:opacity-70"
    >
      <span aria-hidden="true">←</span>
      {label}
    </Link>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <SurfaceCard className="px-8 py-12 text-center md:px-12 md:py-16">
      <div className="mx-auto flex max-w-[540px] flex-col items-center gap-4">
        <h2 className="font-bsava-display text-[28px] leading-[1.05] tracking-[-0.05em] text-[#1d1c1d]">
          {title}
        </h2>
        <p className="font-inter text-[16px] leading-[1.55] text-[#5d5d5d]">{description}</p>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="mt-2 inline-flex items-center justify-center bg-[#1d1c1d] px-5 py-[15px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-white transition-colors hover:bg-black"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </SurfaceCard>
  );
}
