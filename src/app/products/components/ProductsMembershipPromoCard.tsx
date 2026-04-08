import Image from "next/image";
import Link from "next/link";

const MEMBERSHIP_PROMO_IMAGE_URL = "/figma/products-membership-promo.png";

export default function ProductsMembershipPromoCard() {
  return (
    <article className="md:col-span-2 xl:col-span-2">
      <div className="flex h-full flex-col overflow-hidden rounded-[2px] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)]">
        <div className="relative h-[300px] overflow-hidden bg-[#3ba6da]">
          <Image
            src={MEMBERSHIP_PROMO_IMAGE_URL}
            alt="BSAVA membership promotional card"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 66vw, 50vw"
            className="object-cover object-[78%_center] md:scale-[1.33] md:object-[120%_37px]"
            priority
          />
          <span className="absolute bottom-0 left-0 z-[4] rounded-tr-[4px] bg-white px-[10px] py-[5px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-[#1d1c1d]">
            Membership
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-[13px] px-5 pb-[30px] pt-[20px]">
          <h2 className="font-inter text-[16px] font-extrabold leading-[1.5] text-[#1d1c1d]">
            BSAVA Membership
          </h2>

          <p className="font-inter text-[14px] leading-[1.5] text-[#1d1c1d]">
            Whether you are just starting out or leading a practice, BSAVA
            membership supports you at every stage of your veterinary career.
            Join a thriving community of over 10,000 veterinary professionals
            from students to advanced practitioners, all working together to
            advance small animal care.
          </p>

          <div className="flex flex-col gap-[5px]">
            <div className="flex w-full items-center gap-5 border-y border-[rgba(229,229,229,0.5)] py-[5px]">
              <div className="flex min-w-[110px] flex-col">
                <span className="font-inter text-[14px] leading-[1.5] text-[#1d1c1d]">
                  Student members:
                </span>
                <span className="font-inter text-[14px] font-semibold leading-[1.5] text-[#1d1c1d]">
                  £FREE
                </span>
              </div>

              <div className="flex min-w-[110px] flex-col">
                <span className="font-inter text-[14px] leading-[1.5] text-white">
                  Membership:
                </span>
                <span className="font-inter text-[14px] font-semibold leading-[1.5] text-[#1d1c1d]">
                  From £XX
                </span>
              </div>
            </div>
            <div className="min-h-[21px]" aria-hidden="true" />
          </div>

          <Link
            href="/membership-benefits"
            className="mt-auto inline-flex w-fit items-center justify-center bg-[#1d1c1d] px-5 py-[15px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-white transition-colors hover:bg-black"
          >
            More details
          </Link>
        </div>
      </div>
    </article>
  );
}
