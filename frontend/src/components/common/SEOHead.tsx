import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description?: string;
  noindex?: boolean;
}

const SITE = 'Shop Ảnh nổi 3D Lenticular';
const DEFAULT_DESC = 'Lenti Lab chúc bạn một ngày tốt lành. In ấn 3D lenticular, huy hiệu, sản phẩm quảng bá và quà tặng thương hiệu.';

export function SEOHead({ title, description = DEFAULT_DESC, noindex = false }: SEOHeadProps) {
  const fullTitle = `${title} | ${SITE}`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={SITE} />
    </Helmet>
  );
}
