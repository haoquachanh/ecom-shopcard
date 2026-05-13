import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import {
  SHOP_ADDRESS,
  SHOP_DEFAULT_IMAGE,
  SHOP_EMAIL,
  SHOP_HOTLINE,
  SHOP_KEYWORDS,
  SHOP_NAME,
  SHOP_SHORT_NAME,
  SHOP_TAGLINE,
  SITE_URL,
} from '@/lib/site';

interface SEOHeadProps {
  title: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  keywords?: string[];
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_DESC = `${SHOP_SHORT_NAME} thiết kế và sản xuất ảnh nổi 3D lenticular, standee mica, ảnh flip, ảnh depth, thẻ motion và POSM cho quà tặng thương hiệu.`;

function getOrigin() {
  if (SITE_URL) return SITE_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const origin = getOrigin();
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return origin ? `${origin}${path}` : path;
}

function cleanDescription(value: string) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 160);
}

function jsonLd(data: Record<string, unknown> | Array<Record<string, unknown>>) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function baseStructuredData(siteUrl: string) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SHOP_SHORT_NAME,
      legalName: SHOP_NAME,
      url: siteUrl,
      logo: absoluteUrl(SHOP_DEFAULT_IMAGE),
      email: SHOP_EMAIL,
      telephone: SHOP_HOTLINE,
      address: {
        '@type': 'PostalAddress',
        streetAddress: SHOP_ADDRESS,
        addressLocality: 'Ho Chi Minh City',
        addressCountry: 'VN',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SHOP_NAME,
      alternateName: SHOP_SHORT_NAME,
      url: siteUrl,
      description: SHOP_TAGLINE,
      inLanguage: 'vi-VN',
    },
  ];
}

export function SEOHead({
  title,
  description = DEFAULT_DESC,
  canonicalPath,
  image = SHOP_DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  keywords = [],
  structuredData,
}: SEOHeadProps) {
  const location = useLocation();
  const origin = getOrigin();
  const canonicalUrl = absoluteUrl(canonicalPath || location.pathname || '/');
  const imageUrl = absoluteUrl(image);
  const fullTitle = title.includes(SHOP_SHORT_NAME) ? title : `${title} | ${SHOP_SHORT_NAME}`;
  const metaDescription = cleanDescription(description);
  const allKeywords = Array.from(new Set([...SHOP_KEYWORDS, ...keywords])).join(', ');
  const pageStructuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'product' ? 'ItemPage' : 'WebPage',
    name: fullTitle,
    description: metaDescription,
    url: canonicalUrl,
    inLanguage: 'vi-VN',
    isPartOf: {
      '@type': 'WebSite',
      name: SHOP_NAME,
      url: origin || canonicalUrl,
    },
  };
  const customStructuredData = Array.isArray(structuredData)
    ? structuredData
    : structuredData
      ? [structuredData]
      : [];
  const structuredItems = [...baseStructuredData(origin || canonicalUrl), pageStructuredData, ...customStructuredData];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={allKeywords} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <meta name="author" content={SHOP_SHORT_NAME} />
      <meta name="language" content="vi" />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:site_name" content={SHOP_SHORT_NAME} />
      <meta property="og:type" content={type === 'product' ? 'product' : type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content="vi_VN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={imageUrl} />

      <script type="application/ld+json">{jsonLd(structuredItems)}</script>
    </Helmet>
  );
}
