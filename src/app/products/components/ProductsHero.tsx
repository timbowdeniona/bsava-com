const FILTER_LABELS = ["Books", "eBooks", "Events", "Courses", "Membership"] as const;

export default function ProductsHero() {
  return (
    <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-[18px] px-6 pb-[16px] pt-[40px] text-center md:gap-[20px]">
        <h1 className="font-bsava-display text-[34px] leading-[1.02] tracking-[-0.05em] text-[#1d1c1d] md:text-[42px] lg:text-[48px]">
          Resources
        </h1>

        <div className="flex max-w-[840px] flex-wrap items-center justify-center gap-x-[2px] gap-y-2 font-inter text-[16px] leading-[1.4] text-[#1d1c1d] md:text-[20px]">
          <span className="mr-[6px] font-normal text-[#3a3a3a]">FILTER BY:</span>

          {FILTER_LABELS.map((label, index) => (
            <span key={label} className="inline-flex items-center gap-[10px]">
              <span className="font-semibold text-[#2b2b2b]">{label}</span>
              {index < FILTER_LABELS.length - 1 ? (
                <span className="text-[#c8c8c8]" aria-hidden="true">
                  |
                </span>
              ) : null}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
