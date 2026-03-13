"use client";

import Image from "next/image";

import { useCart } from "@/lib/store/useCart";
import type { PimcoreProduct } from "@/types/pimcore";

const ROVER_PROMO_LOGO_URL = "/figma/products-rover-logo.svg";

const formatPrice = (price?: number) => {
  if (price === undefined || price === null) return "£FREE";
  if (price === 0) return "£FREE";
  return `£${price.toFixed(2)}`;
};

export default function ProductsRoverPromoCard({ product }: { product: PimcoreProduct }) {
  const addItem = useCart((state) => state.addItem);

  return (
    <article className="md:col-span-2 xl:col-span-2">
      <div className="flex h-full flex-col overflow-hidden rounded-[2px] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)]">
        <div className="relative flex h-[300px] items-center justify-center overflow-hidden bg-[#97d5eb] px-8">
          <Image
            src={ROVER_PROMO_LOGO_URL}
            alt="BSAVA Rover"
            width={248}
            height={109}
            className="h-auto w-[248px] max-w-full"
            priority
          />

          <span className="absolute bottom-0 left-0 bg-white px-[10px] py-[5px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-[#1d1c1d]">
            AI Tool
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-[13px] px-5 pb-[30px] pt-[20px]">
          <h2 className="font-inter text-[16px] font-extrabold leading-[1.5] text-[#1d1c1d]">
            Ask Rover
          </h2>

          <p className="font-inter text-[14px] leading-[1.5] text-[#1d1c1d]">
            Navigate the BSAVA&apos;s resources effortlessly with conversational
            search. From protocols to procedures, get accurate answers without
            endless scrolling.
          </p>

          <div className="flex flex-col gap-[5px]">
            <div className="flex w-full items-start gap-5 border-y border-[rgba(229,229,229,0.5)] py-[5px]">
              <div className="flex min-w-[120px] flex-col">
                <span className="font-inter text-[14px] leading-[1.5] text-[#1d1c1d]">
                  Non-members:
                </span>
                <span className="font-inter text-[14px] font-semibold leading-[1.5] text-[#1d1c1d]">
                  {formatPrice(product.nonMemberPrice)}
                </span>
              </div>

              <div className="flex min-w-[120px] flex-col">
                <span className="font-inter text-[14px] leading-[1.5] text-[#1d1c1d]">
                  Members:
                </span>
                <span className="font-inter text-[14px] font-semibold leading-[1.5] text-[#1d1c1d]">
                  {formatPrice(product.memberPrice)}
                </span>
                <span className="font-inter text-[11px] leading-[1.35] text-[#747474]">
                  {product.title}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => addItem(product)}
            className="mt-auto inline-flex w-fit items-center justify-center bg-[#1d1c1d] px-5 py-[15px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-white transition-colors hover:bg-black"
          >
            Chat to Rover
          </button>
        </div>
      </div>
    </article>
  );
}
