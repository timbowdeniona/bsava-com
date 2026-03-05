import { EntryFieldTypes } from 'contentful';

export interface ArticleSkeleton {
  contentTypeId: 'article';
  fields: {
    headline: EntryFieldTypes.Text;
    slug: EntryFieldTypes.Text;
    coverImage?: EntryFieldTypes.AssetLink;
    publicationDate?: EntryFieldTypes.Date;
    body: EntryFieldTypes.RichText;
    author?: EntryFieldTypes.EntryLink<AuthorSkeleton>;
  };
}

export interface AuthorSkeleton {
  contentTypeId: 'author';
  fields: {
    name: EntryFieldTypes.Text;
    slug: EntryFieldTypes.Text;
    bio?: EntryFieldTypes.RichText;
    avatar?: EntryFieldTypes.AssetLink;
    email?: EntryFieldTypes.Text;
  };
}

export interface SEOSkeleton {
  contentTypeId: 'seo';
  fields: {
    metaTitle: EntryFieldTypes.Text;
    metaDescription: EntryFieldTypes.Text;
    shareImage?: EntryFieldTypes.AssetLink;
  };
}

export interface LandingPageSkeleton {
  contentTypeId: 'landingPage';
  fields: {
    title: EntryFieldTypes.Text;
    slug: EntryFieldTypes.Text;
    modules: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<ArticleSkeleton | AuthorSkeleton | SEOSkeleton>>;
    seo?: EntryFieldTypes.EntryLink<SEOSkeleton>;
  };
}

export interface MembershipSkeleton {
  contentTypeId: 'membership';
  fields: {
    title: EntryFieldTypes.Text;
    type: EntryFieldTypes.Text;
    price: EntryFieldTypes.Text;
    priceDescription?: EntryFieldTypes.Text;
    benefits?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
    detailedBenefits?: EntryFieldTypes.RichText;
    ctaLink?: EntryFieldTypes.Text;
    ctaText?: EntryFieldTypes.Text;
  };
}

export interface TestimonialSkeleton {
  contentTypeId: 'testimonial';
  fields: {
    headline?: EntryFieldTypes.Text;
    subHeadline?: EntryFieldTypes.Text;
    body?: EntryFieldTypes.RichText;
    author?: EntryFieldTypes.Text;
    authorPosition?: EntryFieldTypes.Text;
    rating?: EntryFieldTypes.Integer;
  };
}
