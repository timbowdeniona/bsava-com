const FIGMA_HERO_IMAGE_URL =
  "/figma/bsava-home-hero-node-14-47.png";

export default function HomeHero() {
  return (
    <section
      className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden bg-black"
      aria-label="British Small Animal Veterinary Association"
    >
      <div className="relative min-h-[380px] md:min-h-[420px] lg:min-h-[442px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FIGMA_HERO_IMAGE_URL}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[22%_center] sm:object-[26%_center] md:object-[32%_center] lg:object-center"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.24)_36%,rgba(0,0,0,0.78)_100%)] lg:hidden"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(0,0,0,0)_42%,rgba(0,31,54,0.48)_49%,rgba(0,31,54,0.92)_56%,rgba(0,31,54,0.98)_100%)] lg:block"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex min-h-[380px] max-w-[1376px] items-end px-6 py-10 md:min-h-[420px] md:px-10 md:py-12 lg:min-h-[442px] lg:items-center lg:px-12 lg:py-12 xl:px-16">
          <div className="w-full max-w-[592px] lg:ml-auto">
            <h1 className="font-bsava-display text-[34px] leading-[1.02] tracking-[-0.05em] text-white md:text-[40px] lg:text-[48px]">
              British Small Animal Veterinary Association
            </h1>

            <p className="mt-5 max-w-[592px] font-inter text-[18px] font-semibold leading-[1.4] text-white md:text-[19px] lg:mt-6 lg:text-[20px]">
              Providing resources, education, and representation for small animal
              veterinary professionals across the UK.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
