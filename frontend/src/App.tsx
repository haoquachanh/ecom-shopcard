import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminRoute } from '@/components/common/ProtectedRoute';

// Public pages
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import PriceList from '@/pages/PriceList';
import { AuthLayout } from '@/layouts/AuthLayout';
import Loved from '@/pages/Loved';
import ProductDetail from '@/pages/ProductDetail';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminProductTypes from '@/pages/admin/ProductTypes';
import AdminSamples from '@/pages/admin/Samples';
import AdminPriceGrids from '@/pages/admin/PriceGrids';
import AdminUsers from '@/pages/admin/Users';

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

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="product-types" element={<AdminProductTypes />} />
        <Route path="samples" element={<AdminSamples />} />
        <Route path="price-grids" element={<AdminPriceGrids />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
