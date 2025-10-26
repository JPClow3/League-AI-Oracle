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
}

const DEFAULT_SEO = {
  title: 'League AI Oracle - Smart Draft Analysis & Strategy Tool',
  description: 'Master League of Legends draft phase with AI-powered analysis, champion recommendations, and team composition insights. Perfect your strategy and climb the ranks.',
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
  image: '/og-image.png',
  url: 'https://league-ai-oracle.app',
};

/**
 * SEO Component
 * Manages meta tags for better discoverability
 */
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

      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:site_name" content="League AI Oracle" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <link rel="canonical" href={seo.url} />

      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#1a1a2e" />

      {/* PWA */}
      <meta name="application-name" content="League AI Oracle" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="League AI Oracle" />
    </Helmet>
  );
};

// Pre-configured SEO for common pages
export const HomeSEO = () => (
  <SEO
    title="Home"
    description="Master your League of Legends draft phase with AI-powered insights. Get champion recommendations, analyze team compositions, and dominate the meta."
  />
);

export const DraftLabSEO = () => (
  <SEO
    title="Draft Lab"
    description="Build and analyze your perfect League of Legends team composition. Get AI-powered suggestions for picks, bans, and synergies."
    keywords={[...DEFAULT_SEO.keywords, 'draft lab', 'team builder', 'composition']}
  />
);

export const ArenaSEO = () => (
  <SEO
    title="Arena Mode"
    description="Practice your draft strategy in real-time with Arena Mode. Compete against AI or friends in full draft simulations."
    keywords={[...DEFAULT_SEO.keywords, 'arena', 'practice', 'simulation']}
  />
);

export const PlaybookSEO = () => (
  <SEO
    title="Playbook"
    description="Browse and create champion strategies and team compositions. Save your favorite drafts and share with your team."
    keywords={[...DEFAULT_SEO.keywords, 'playbook', 'strategies', 'guides']}
  />
);

export const MetaOracleSEO = () => (
  <SEO
    title="Meta Oracle"
    description="Stay ahead of the meta with AI-analyzed trends, champion tier lists, and patch insights for League of Legends."
    keywords={[...DEFAULT_SEO.keywords, 'meta', 'tier list', 'trends', 'patch notes']}
  />
);

export const AcademySEO = () => (
  <SEO
    title="Academy"
    description="Learn draft fundamentals, advanced strategies, and team composition theory with interactive lessons."
    keywords={[...DEFAULT_SEO.keywords, 'academy', 'lessons', 'learn', 'tutorial']}
  />
);

