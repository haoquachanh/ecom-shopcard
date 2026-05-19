import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Activity, Database, Package, Sparkles, Users } from 'lucide-react';
import { adminApi } from '@/shared/api/adminApi';
import { Badge, Card, EmptyState, LoadingRows, PageHeader } from '@/shared/components/ui';
import { formatDate, formatNumber } from '@/shared/lib/format';

export function DashboardPage() {
  const [productTypesQuery, samplesQuery, usersQuery] = useQueries({
    queries: [
      { queryKey: ['product-types'], queryFn: adminApi.listProductTypes },
      { queryKey: ['samples'], queryFn: () => adminApi.listSamples() },
      { queryKey: ['users', 'dashboard'], queryFn: () => adminApi.listUsers({ page: 1, pageSize: 5 }), retry: false },
    ],
  });

  const health = useQuery({ queryKey: ['health-dashboard'], queryFn: adminApi.health, retry: false });

  const recentRows = useMemo(() => {
    const samples = (samplesQuery.data ?? []).map((item) => ({
      type: 'Sample',
      name: item.name,
      status: item.isActive === false ? 'Ẩn' : 'Hiển thị',
      updatedAt: item.updatedAt || item.createdAt,
    }));
    const productTypes = (productTypesQuery.data ?? []).map((item) => ({
      type: 'Product Type',
      name: item.name,
      status: item.isActive === false ? 'Ẩn' : 'Hiển thị',
      updatedAt: item.updatedAt || item.createdAt,
    }));
    return [...samples, ...productTypes]
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
      .slice(0, 8);
  }, [productTypesQuery.data, samplesQuery.data]);

  const stats = [
    {
      label: 'Loại sản phẩm',
      value: productTypesQuery.data?.length ?? 0,
      icon: Package,
      loading: productTypesQuery.isLoading,
    },
    {
      label: 'Mẫu thiết kế',
      value: samplesQuery.data?.length ?? 0,
      icon: Sparkles,
      loading: samplesQuery.isLoading,
    },
    {
      label: 'Người dùng',
      value: usersQuery.data?.length ?? 0,
      icon: Users,
      loading: usersQuery.isLoading,
      note: usersQuery.isError ? 'Cần API admin users' : undefined,
    },
    {
      label: 'Backend',
      value: health.isError ? 'Chưa rõ' : 'Online',
      icon: Database,
      loading: health.isLoading,
    },
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        description="Tổng quan dữ liệu chính, trạng thái API và các bản ghi vừa cập nhật."
      />

      <div className="stats-grid">
        {stats.map((stat) => (
          <Card className="stat-card" key={stat.label}>
            <div>
              <span>{stat.label}</span>
              <strong>{stat.loading ? <span className="mini-skeleton" /> : typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}</strong>
              {stat.note ? <small>{stat.note}</small> : null}
            </div>
            <div className="stat-icon">
              <stat.icon size={20} />
            </div>
          </Card>
        ))}
      </div>

      <div className="dashboard-grid">
        <Card className="table-card">
          <div className="card-heading">
            <div>
              <h2>Dữ liệu gần đây</h2>
              <p>Ghép từ product types và samples public API hiện có.</p>
            </div>
            <Activity size={18} />
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Entity</th>
                <th>Tên</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {productTypesQuery.isLoading || samplesQuery.isLoading ? <LoadingRows columns={4} /> : null}
              {!productTypesQuery.isLoading && !samplesQuery.isLoading && recentRows.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState title="Chưa có dữ liệu" description="Backend chưa trả product types hoặc samples." />
                  </td>
                </tr>
              ) : null}
              {recentRows.map((row) => (
                <tr key={`${row.type}-${row.name}`}>
                  <td>{row.type}</td>
                  <td className="strong-cell">{row.name}</td>
                  <td>
                    <Badge tone={row.status === 'Hiển thị' ? 'success' : 'muted'}>{row.status}</Badge>
                  </td>
                  <td>{formatDate(row.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="status-card">
          <h2>Backend/database status</h2>
          <div className="status-list">
            <div>
              <span>Auth</span>
              <Badge tone="success">/auth/login + /auth/refresh</Badge>
            </div>
            <div>
              <span>Profile</span>
              <Badge tone="success">/profile</Badge>
            </div>
            <div>
              <span>Catalog read</span>
              <Badge tone="success">/product-types, /samples</Badge>
            </div>
            <div>
              <span>Admin CRUD</span>
              <Badge tone="warning">Cần bổ sung backend</Badge>
            </div>
            <div>
              <span>Health endpoint</span>
              <Badge tone={health.isError ? 'danger' : 'success'}>{health.isError ? 'Thiếu /health' : 'OK'}</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
