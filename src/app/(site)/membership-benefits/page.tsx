/* eslint-disable @typescript-eslint/no-explicit-any */
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import type { Entry } from 'contentful';
import Link from 'next/link';

import { PageContainer, PageHero, SectionHeading, SurfaceCard } from '@/components/page/PagePrimitives';
import { contentfulClient } from '@/lib/contentful';
import { MembershipSkeleton, TestimonialSkeleton } from '@/types/contentful';

export default async function MembershipBenefitsPage() {
  const membershipResponse = await contentfulClient.getEntries<MembershipSkeleton>({
    content_type: 'membership',
    order: ['sys.createdAt'] as any,
  });

  const testimonialResponse = await contentfulClient.getEntries<TestimonialSkeleton>({
    content_type: 'testimonial',
    limit: 3,
  });

  const memberships = membershipResponse.items;
  const testimonials = testimonialResponse.items;

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        title="BSAVA Membership"
        description="Join a thriving veterinary community and access benefits, resources, and support tailored to every stage of small animal practice."
      />

      <PageContainer className="flex flex-col gap-14 pb-16 md:gap-16 md:pb-20">
        <section className="flex flex-col gap-8">
          <SectionHeading
            title="Membership Options"
            description="Whether you are studying, recently graduated, or well established in practice, there is a BSAVA membership option to support your next step."
          />

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {memberships.map((membership: Entry<MembershipSkeleton, "WITHOUT_LINK_RESOLUTION", string>) => (
            <SurfaceCard
              key={membership.sys.id} 
              className="flex h-full flex-col p-8"
            >
              {membership.fields.type === 'vet' && (
                <div className="mb-5 inline-flex w-fit items-center justify-center bg-[#1d1c1d] px-[10px] py-[5px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-white">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6 flex flex-col gap-3">
                <h3 className="font-inter text-[24px] font-extrabold leading-[1.2] text-[#1d1c1d]">
                  {membership.fields.title}
                </h3>
                <div className="flex items-end gap-2">
                  <span className="font-bsava-display text-[34px] leading-[1] tracking-[-0.05em] text-[#1d1c1d]">
                    {membership.fields.price}
                  </span>
                </div>
                {membership.fields.priceDescription && (
                  <p className="font-inter text-[14px] leading-[1.5] text-[#5d5d5d]">
                    {membership.fields.priceDescription}
                  </p>
                )}
              </div>

              <div className="flex-grow">
                <h4 className="mb-4 font-inter text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6d6d6d]">
                  Key Benefits
                </h4>
                {membership.fields.benefits && membership.fields.benefits.length > 0 && (
                  <ul className="mb-8 space-y-3">
                    {membership.fields.benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex gap-3 font-inter text-[15px] leading-[1.55] text-[#1d1c1d]">
                        <span className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1d1c1d] text-[11px] text-white">
                          ✓
                        </span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {membership.fields.detailedBenefits ? (
                  <div className="content-rich border-t border-[#e5e5e5] pt-6">
                    {documentToReactComponents(membership.fields.detailedBenefits as any)}
                  </div>
                ) : null}
              </div>

              {membership.fields.ctaLink && (
                <Link
                  href={membership.fields.ctaLink}
                  className="mt-8 inline-flex w-full items-center justify-center bg-[#1d1c1d] px-5 py-[15px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-white transition-colors hover:bg-black"
                >
                  {membership.fields.ctaText || 'Join Now'}
                </Link>
              )}
            </SurfaceCard>
          ))}
          </div>
        </section>

        {testimonials.length > 0 ? (
          <section className="flex flex-col gap-8">
            <SectionHeading
              title="What Our Members Say"
              description="Feedback from members using BSAVA resources and membership benefits in practice."
            />
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {testimonials.map((testimonial: Entry<TestimonialSkeleton, "WITHOUT_LINK_RESOLUTION", string>) => (
                <SurfaceCard key={testimonial.sys.id} className="relative h-full p-8">
                  <div className="absolute left-6 top-6 text-[#1d1c1d]/8">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21L16.411 14.593H10V3H24V14.593L20.409 21H14.017ZM0 21L2.394 14.593H-4.938V3H10V14.593L6.392 21H0Z" />
                    </svg>
                  </div>
                  <div className="relative z-10 flex h-full flex-col">
                    <div className="content-rich mb-6 flex-1 font-inter text-[16px] italic leading-[1.7] text-[#1d1c1d]">
                      {testimonial.fields.body && documentToReactComponents(testimonial.fields.body as any)}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1d1c1d]/8 font-inter text-[18px] font-semibold uppercase text-[#1d1c1d]">
                        {testimonial.fields.author?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <h4 className="font-inter text-[16px] font-extrabold leading-[1.4] text-[#1d1c1d]">
                          {testimonial.fields.author}
                        </h4>
                        <p className="font-inter text-[14px] leading-[1.5] text-[#5d5d5d]">
                          {testimonial.fields.authorPosition}
                        </p>
                      </div>
                    </div>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </section>
        ) : null}

        <SurfaceCard className="px-8 py-12 md:px-12 md:py-14">
          <div className="mx-auto flex max-w-[760px] flex-col items-center gap-5 text-center">
            <SectionHeading
              title="Ready to start exploring?"
              description="Join BSAVA today and begin making the most of our membership benefits and clinical resources."
            />
            <Link 
              href="https://bsavaportal.bsava.com/s/membership-selection" 
              className="inline-flex items-center justify-center bg-[#1d1c1d] px-5 py-[15px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-white transition-colors hover:bg-black"
            >
              Explore Membership Categories
            </Link>
          </div>
        </SurfaceCard>
      </PageContainer>
    </div>
  );
}
