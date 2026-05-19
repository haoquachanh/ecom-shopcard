import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, UserX } from 'lucide-react';
import { adminApi } from '@/shared/api/adminApi';
import { Badge, Button, Card, EmptyState, Input, LoadingRows, PageHeader, Select } from '@/shared/components/ui';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useToast } from '@/shared/components/toast';
import { formatDate } from '@/shared/lib/format';
import type { AdminUser } from '@/shared/types/api';

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pendingUser, setPendingUser] = useState<AdminUser | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const usersQuery = useQuery({
    queryKey: ['users', { search, status, page }],
    queryFn: () => adminApi.listUsers({ search, status, page, pageSize: 20 }),
    retry: false,
  });

  const filtered = useMemo(() => {
    const rows = usersQuery.data ?? [];
    return rows.filter((user) => {
      const text = `${user.email} ${user.name ?? ''} ${user.phone ?? ''}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus =
        status === 'all' || (status === 'active' ? user.isActive !== false : user.isActive === false);
      return matchesSearch && matchesStatus;
    });
  }, [search, status, usersQuery.data]);

  const statusMutation = useMutation({
    mutationFn: (user: AdminUser) => adminApi.updateUserStatus(user.id, !(user.isActive ?? true)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Đã cập nhật trạng thái user', tone: 'success' });
    },
    onError: () => {
      toast({
        title: 'Backend chưa hỗ trợ cập nhật user',
        description: 'Cần bổ sung PATCH /admin/users/:id/status.',
        tone: 'error',
      });
    },
  });

  return (
    <div className="page-stack">
      <PageHeader
        title="User Management"
        description="Search, filter, pagination và cập nhật trạng thái khi backend có endpoint admin."
      />

      <Card className="toolbar-card">
        <div className="search-box">
          <Search size={16} />
          <Input placeholder="Tìm theo email, tên, số điện thoại..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </Select>
      </Card>

      <Card className="table-card">
        {usersQuery.isError ? (
          <EmptyState
            title="Backend chưa có API danh sách user"
            description="Admin app đang gọi GET /admin/users. Chi tiết đã được ghi trong ADMIN_API_REQUIREMENTS.md."
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Họ tên</th>
                <th>Điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {usersQuery.isLoading ? <LoadingRows columns={7} /> : null}
              {!usersQuery.isLoading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState title="Không có user phù hợp" />
                  </td>
                </tr>
              ) : null}
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td className="strong-cell">{user.email}</td>
                  <td>{user.name || user.fullName || '-'}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <Badge tone={user.role === 'admin' || user.isAdmin ? 'default' : 'muted'}>
                      {user.role === 'admin' || user.isAdmin ? 'Admin' : 'User'}
                    </Badge>
                  </td>
                  <td>
                    <Badge tone={user.isActive === false ? 'danger' : 'success'}>
                      {user.isActive === false ? 'Đã khóa' : 'Hoạt động'}
                    </Badge>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td className="right-cell">
                    <Button size="sm" variant="outline" onClick={() => setPendingUser(user)}>
                      {user.isActive === false ? <UserCheck size={15} /> : <UserX size={15} />}
                      {user.isActive === false ? 'Mở khóa' : 'Khóa'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div className="pagination">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
          Trước
        </Button>
        <span>Trang {page}</span>
        <Button variant="outline" size="sm" disabled={(usersQuery.data?.length ?? 0) < 20} onClick={() => setPage((value) => value + 1)}>
          Sau
        </Button>
      </div>

      <ConfirmDialog
        open={Boolean(pendingUser)}
        title="Cập nhật trạng thái user?"
        description={`Thao tác này sẽ ${pendingUser?.isActive === false ? 'mở khóa' : 'khóa'} tài khoản ${pendingUser?.email}.`}
        confirmText="Tiếp tục"
        onCancel={() => setPendingUser(null)}
        onConfirm={() => {
          if (pendingUser) statusMutation.mutate(pendingUser);
          setPendingUser(null);
        }}
      />
    </div>
  );
}
