/* eslint-disable @typescript-eslint/no-explicit-any */
import { contentfulClient } from '@/lib/contentful';
import { MembershipSkeleton, TestimonialSkeleton } from '@/types/contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import type { Entry } from 'contentful';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-20 px-4 md:px-8 lg:px-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">BSAVA Membership</h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
          Join the Veterinary Community. Access exclusive benefits and resources. Enhance your career in small animal veterinary practice.
        </p>
      </section>

      {/* Comparisons Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Membership Options</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Supporting you at every stage of your career whether you are studying, a recent graduate or advanced in your career, there is a membership option just for you!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {memberships.map((membership: Entry<MembershipSkeleton, "WITHOUT_LINK_RESOLUTION", string>) => (
            <div 
              key={membership.sys.id} 
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col relative overflow-hidden transition-transform hover:-translate-y-1"
            >
              {membership.fields.type === 'vet' && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{membership.fields.title}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-extrabold text-blue-900">{membership.fields.price}</span>
                </div>
                {membership.fields.priceDescription && (
                  <p className="text-sm text-gray-500 font-medium">{membership.fields.priceDescription}</p>
                )}
              </div>

              <div className="flex-grow">
                <h4 className="font-semibold text-gray-900 mb-4 uppercase tracking-wider text-sm">Key Benefits</h4>
                {membership.fields.benefits && membership.fields.benefits.length > 0 && (
                  <ul className="space-y-3 mb-8">
                    {membership.fields.benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex gap-3 text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {membership.fields.ctaLink && (
                <Link
                  href={membership.fields.ctaLink}
                  className="mt-6 w-full py-4 text-center rounded-xl font-bold text-white transition-colors focus:ring-4 focus:outline-none focus:ring-blue-300 bg-blue-600 hover:bg-blue-700 block"
                >
                  {membership.fields.ctaText || 'Join Now'}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="bg-white py-16 px-4 md:px-8 lg:px-16 border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Members Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial: Entry<TestimonialSkeleton, "WITHOUT_LINK_RESOLUTION", string>) => (
                <div key={testimonial.sys.id} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm relative">
                  <div className="absolute top-6 left-6 text-blue-200 opacity-50">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.017 21L16.411 14.593H10V3H24V14.593L20.409 21H14.017ZM0 21L2.394 14.593H-4.938V3H10V14.593L6.392 21H0Z" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <div className="prose prose-blue text-gray-700 text-lg italic mb-6">
                      {testimonial.fields.body && documentToReactComponents(testimonial.fields.body as any)}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl uppercase">
                        {testimonial.fields.author?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{testimonial.fields.author}</h4>
                        <p className="text-sm text-gray-500 font-medium">{testimonial.fields.authorPosition}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 text-center bg-blue-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to start exploring?</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Join the BSAVA today and start taking advantage of our comprehensive collection of resources.
        </p>
        <Link 
          href="https://bsavaportal.bsava.com/s/membership-selection" 
          className="inline-block bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Explore Membership Categories
        </Link>
      </section>
    </div>
  );
}
