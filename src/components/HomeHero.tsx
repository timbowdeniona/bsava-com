const FIGMA_HERO_IMAGE_URL =
  "/figma/bsava-home-hero-node-14-47.png";

export default function HomeHero() {
  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      aria-label="British Small Animal Veterinary Association"
      data-node-id="2048:26"
    >
      <div className="relative min-h-[380px] md:min-h-[420px] lg:min-h-[442px] xl:h-[440px] xl:min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FIGMA_HERO_IMAGE_URL}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[21%_center] sm:object-[24%_center] md:object-[28%_center] lg:object-[34%_center] xl:object-center"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,6,24,0.06)_0%,rgba(8,6,24,0.18)_34%,rgba(34,21,95,0.74)_72%,rgba(34,21,95,0.96)_100%)] md:hidden"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(34,21,95,0)_22%,rgba(34,21,95,0.18)_44%,rgba(34,21,95,0.72)_68%,#22155f_100%)] md:block xl:hidden"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 hidden xl:block"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,21,95,0)_43%,rgba(34,21,95,0.24)_55%,rgba(34,21,95,0.84)_71%,#22155f_100%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[380px] max-w-[1376px] items-end px-6 py-10 sm:px-8 md:min-h-[420px] md:items-center md:px-10 md:py-12 lg:min-h-[442px] lg:px-12 lg:py-12 xl:h-[440px] xl:min-h-0 xl:px-0 xl:py-0">
          <div className="w-full max-w-[25rem] md:ml-auto md:max-w-[29rem] lg:w-[33rem] lg:max-w-none xl:mr-[79px] xl:w-[592px]">
            <h1 className="font-bsava-display text-[34px] leading-[1.04] tracking-[-0.05em] text-white sm:text-[38px] md:text-[40px] md:leading-[1.08] lg:text-[44px] lg:leading-[1.14] xl:text-[48px] xl:leading-[1.3]">
              British Small Animal Veterinary Association
            </h1>

            <p className="mt-4 font-inter text-[17px] font-semibold leading-[1.45] text-white sm:text-[18px] md:mt-5 md:text-[18px] lg:mt-6 lg:text-[19px] xl:mt-[7px] xl:text-[20px] xl:leading-[1.4]">
              Providing resources, education, and representation for small animal
              veterinary professionals across the UK.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
