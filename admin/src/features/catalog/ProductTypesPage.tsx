import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus } from 'lucide-react';
import { adminApi } from '@/shared/api/adminApi';
import { Badge, Button, Card, EmptyState, Input, Label, LoadingRows, PageHeader, Textarea } from '@/shared/components/ui';
import { useToast } from '@/shared/components/toast';
import { formatDate } from '@/shared/lib/format';
import type { ProductType } from '@/shared/types/api';

const productTypeSchema = z.object({
  name: z.string().min(2, 'Tên cần ít nhất 2 ký tự'),
  description: z.string().optional(),
  imageUrl: z.string().url('URL ảnh không hợp lệ').or(z.literal('')).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

type ProductTypeForm = z.infer<typeof productTypeSchema>;

export function ProductTypesPage() {
  const [editing, setEditing] = useState<ProductType | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const query = useQuery({ queryKey: ['product-types'], queryFn: adminApi.listProductTypes });

  const form = useForm<ProductTypeForm>({
    resolver: zodResolver(productTypeSchema),
    defaultValues: { name: '', description: '', imageUrl: '', sortOrder: 0 },
  });

  const mutation = useMutation({
    mutationFn: (values: ProductTypeForm) => {
      const payload = { ...values, imageUrl: values.imageUrl || null };
      return editing ? adminApi.updateProductType(editing.id, payload) : adminApi.createProductType(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-types'] });
      setEditing(null);
      form.reset({ name: '', description: '', imageUrl: '', sortOrder: 0 });
      toast({ title: 'Đã lưu loại sản phẩm', tone: 'success' });
    },
    onError: () => {
      toast({
        title: 'Backend chưa hỗ trợ ghi loại sản phẩm',
        description: 'Cần bổ sung POST/PUT /admin/product-types.',
        tone: 'error',
      });
    },
  });

  function openEdit(row: ProductType) {
    setEditing(row);
    form.reset({
      name: row.name,
      description: row.description ?? '',
      imageUrl: row.imageUrl ?? '',
      sortOrder: row.sortOrder ?? 0,
    });
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Product Types"
        description="Quản lý nhóm sản phẩm chính. API đọc hiện có: GET /product-types."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              form.reset({ name: '', description: '', imageUrl: '', sortOrder: 0 });
            }}
          >
            <Plus size={16} />
            Tạo mới
          </Button>
        }
      />

      <div className="split-grid">
        <Card className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Trạng thái</th>
                <th>Sort</th>
                <th>Cập nhật</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? <LoadingRows columns={5} /> : null}
              {!query.isLoading && (query.data?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState title="Chưa có loại sản phẩm" />
                  </td>
                </tr>
              ) : null}
              {query.data?.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="entity-cell">
                      {row.imageUrl ? <img src={row.imageUrl} alt={row.name} /> : <span className="image-placeholder" />}
                      <div>
                        <strong>{row.name}</strong>
                        <small>{row.description || '-'}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge tone={row.isActive === false ? 'muted' : 'success'}>{row.isActive === false ? 'Ẩn' : 'Hiển thị'}</Badge>
                  </td>
                  <td>{row.sortOrder ?? 0}</td>
                  <td>{formatDate(row.updatedAt)}</td>
                  <td className="right-cell">
                    <Button variant="ghost" size="icon" aria-label="Sửa" onClick={() => openEdit(row)}>
                      <Pencil size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="form-card">
          <h2>{editing ? 'Sửa loại sản phẩm' : 'Tạo loại sản phẩm'}</h2>
          <form className="form-stack" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div>
              <Label htmlFor="name">Tên</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name ? <small className="form-error">{form.formState.errors.name.message}</small> : null}
            </div>
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" rows={4} {...form.register('description')} />
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" {...form.register('imageUrl')} />
              {form.formState.errors.imageUrl ? <small className="form-error">{form.formState.errors.imageUrl.message}</small> : null}
            </div>
            <div>
              <Label htmlFor="sortOrder">Thứ tự</Label>
              <Input id="sortOrder" type="number" min={0} {...form.register('sortOrder')} />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
