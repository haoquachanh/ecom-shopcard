import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import { SEOHead } from '@/components/common/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, Tag } from 'lucide-react';

export default function AdminDashboard() {
  const { data: samples = [] } = useQuery({ queryKey: ['admin-samples'], queryFn: () => adminApi.getSamples() });
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.getUsers() });
  const { data: productTypes = [] } = useQuery({ queryKey: ['admin-product-types'], queryFn: () => adminApi.getProductTypes() });

  const stats = [
    { label: 'Loại sản phẩm', value: productTypes.length, icon: Package, color: 'text-blue-500' },
    { label: 'Mẫu thiết kế', value: samples.length, icon: Tag, color: 'text-purple-500' },
    { label: 'Người dùng', value: users.length, icon: Users, color: 'text-green-500' },
  ];

  return (
    <>
      <SEOHead title="Admin Dashboard" noindex />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </CardHeader>
              <CardContent><p className="text-3xl font-bold">{s.value}</p></CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
