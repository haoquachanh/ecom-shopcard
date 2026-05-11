import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';

// Public pages
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import PriceList from '@/pages/PriceList';
import Loved from '@/pages/Loved';
import ProductDetail from '@/pages/ProductDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="pricing" element={<PriceList />} />
        <Route path="products" element={<Products />} />
        <Route path="loved" element={<Loved />} />
        <Route path="product-loved" element={<Loved />} />
        <Route path="product-detail/:slug" element={<ProductDetail />} />
        <Route path="samples/:slug" element={<ProductDetail />} />
        <Route path="product-sample/:slug" element={<ProductDetail />} />

      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
