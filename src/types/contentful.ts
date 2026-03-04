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
