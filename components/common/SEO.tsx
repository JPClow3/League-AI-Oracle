import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  jsonLd?: Record<string, unknown>;
}

const IS_PREVIEW =
  import.meta.env.VERCEL_ENV === 'preview' ||
  import.meta.env.VITE_VERCEL_ENV === 'preview';

const DEFAULT_URL = 'https://league-ai-oracle.vercel.app';

const DEFAULT_SEO = {
  title: 'League AI Oracle - Smart Draft Analysis & Strategy Tool',
  description:
    'Master the League of Legends draft phase with AI-powered analysis, champion recommendations, and team composition insights.',
  keywords: [
    'league of legends',
    'lol draft',
    'champion select',
    'team composition',
    'lol strategy',
    'draft tool',
    'AI analysis',
    'champion synergy',
    'counter picks',
    'meta',
  ],
  image: `${DEFAULT_URL}/og-image.png`,
  url: DEFAULT_URL,
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  jsonLd,
}) => {
  const seo = {
    title: title ? `${title} | League AI Oracle` : DEFAULT_SEO.title,
    description: description || DEFAULT_SEO.description,
    keywords: keywords || DEFAULT_SEO.keywords,
    image: image || DEFAULT_SEO.image,
    url: url || DEFAULT_SEO.url,
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords.join(', ')} />
      {author && <meta name="author" content={author} />}

      {/* Canonical */}
      <link rel="canonical" href={seo.url} />

      {/* Indexing behavior */}
      <meta
        name="robots"
        content={IS_PREVIEW ? 'noindex, nofollow' : 'index, follow'}
      />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={seo.url} />
      <meta property="og:site_name" content="League AI Oracle" />

      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#1a1a2e" />

      {/* PWA */}
      <meta name="application-name" content="League AI Oracle" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="League AI Oracle" />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

// ------------------------------------------------------
// Pre-configured SEO pages
// ------------------------------------------------------

export const HomeSEO = () => (
  <SEO
    title="Home"
    description="Master your League of Legends draft phase with AI-powered insights. Get champion recommendations, analyze team compositions, and dominate the meta."
    jsonLd={{
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "League AI Oracle",
      url: DEFAULT_URL,
      description:
        "AI-powered League of Legends draft analysis and team composition insights.",
      applicationCategory: "GameApplication",
      operatingSystem: "Any",
    }}
  />
);

export const DraftLabSEO = () => (
  <SEO
    title="Strategy Forge"
    description="Build and analyze your perfect League of Legends team composition with AI-powered synergy and counter insights."
    keywords={[...DEFAULT_SEO.keywords, 'strategy forge', 'draft lab', 'team builder', 'composition']}
  />
);

export const ArenaSEO = () => (
  <SEO
    title="Arena Mode"
    description="Practice draft strategy in real-time with AI or friends in full LoL draft simulations."
    keywords={[...DEFAULT_SEO.keywords, 'arena', 'practice', 'simulation']}
  />
);

export const PlaybookSEO = () => (
  <SEO
    title="Archives"
    description="Browse and create champion strategies, save drafts, and share compositions."
    keywords={[...DEFAULT_SEO.keywords, 'playbook', 'strategies', 'guides']}
  />
);

export const MetaOracleSEO = () => (
  <SEO
    title="Meta Oracle"
    description="Stay ahead of the League of Legends meta with AI-analyzed trends, champion tiers, and patch insights."
    keywords={[...DEFAULT_SEO.keywords, 'meta', 'tier list', 'trends', 'patch notes']}
  />
);

export const AcademySEO = () => (
  <SEO
    title="Academy"
    description="Learn draft fundamentals and advanced strategies with interactive lessons."
    keywords={[...DEFAULT_SEO.keywords, 'academy', 'lessons', 'learn', 'tutorial']}
  />
);
