import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { usePageViewTracking } from '@/services/analytics/usePageViewTracking';

// Public pages
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import PriceList from '@/pages/PriceList';
import Loved from '@/pages/Loved';
import ProductDetail from '@/pages/ProductDetail';

function ProductCanonicalRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/product-detail/${slug || ''}`} replace />;
}

export default function App() {
  usePageViewTracking();

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="pricing" element={<PriceList />} />
        <Route path="products" element={<Products />} />
        <Route path="loved" element={<Loved />} />
        <Route path="product-loved" element={<Navigate to="/loved" replace />} />
        <Route path="product-detail/:slug" element={<ProductDetail />} />
        <Route path="samples/:slug" element={<ProductCanonicalRedirect />} />
        <Route path="product-sample/:slug" element={<ProductCanonicalRedirect />} />

      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
