import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Search } from 'lucide-react';
import { adminApi } from '@/shared/api/adminApi';
import { Badge, Button, Card, EmptyState, Input, Label, LoadingRows, PageHeader, Select, Textarea } from '@/shared/components/ui';
import { useToast } from '@/shared/components/toast';
import { formatDate } from '@/shared/lib/format';
import type { Sample } from '@/shared/types/api';

const sampleSchema = z.object({
  productTypeId: z.coerce.number().int().positive('Chọn loại sản phẩm'),
  name: z.string().min(2, 'Tên cần ít nhất 2 ký tự'),
  description: z.string().optional(),
  imageUrl: z.string().url('URL ảnh không hợp lệ').or(z.literal('')).optional(),
});

type SampleForm = z.infer<typeof sampleSchema>;

export function SamplesPage() {
  const [productTypeId, setProductTypeId] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Sample | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const productTypes = useQuery({ queryKey: ['product-types'], queryFn: adminApi.listProductTypes });
  const samples = useQuery({
    queryKey: ['samples', productTypeId],
    queryFn: () => adminApi.listSamples(productTypeId === 'all' ? undefined : Number(productTypeId)),
  });

  const form = useForm<SampleForm>({
    resolver: zodResolver(sampleSchema),
    defaultValues: { productTypeId: 0, name: '', description: '', imageUrl: '' },
  });

  const filtered = useMemo(() => {
    return (samples.data ?? []).filter((sample) => sample.name.toLowerCase().includes(search.toLowerCase()));
  }, [samples.data, search]);

  const mutation = useMutation({
    mutationFn: (values: SampleForm) => {
      const payload = { ...values, imageUrl: values.imageUrl || null };
      return editing ? adminApi.updateSample(editing.id, payload) : adminApi.createSample(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      setEditing(null);
      form.reset({ productTypeId: 0, name: '', description: '', imageUrl: '' });
      toast({ title: 'Đã lưu sample', tone: 'success' });
    },
    onError: () => {
      toast({
        title: 'Backend chưa hỗ trợ ghi sample',
        description: 'Cần bổ sung POST/PUT /admin/samples.',
        tone: 'error',
      });
    },
  });

  function openEdit(row: Sample) {
    setEditing(row);
    form.reset({
      productTypeId: row.productTypeId,
      name: row.name,
      description: row.description ?? '',
      imageUrl: row.imageUrl ?? '',
    });
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Samples"
        description="Quản lý mẫu thiết kế theo loại sản phẩm. API đọc hiện có: GET /samples."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              form.reset({ productTypeId: productTypes.data?.[0]?.id ?? 0, name: '', description: '', imageUrl: '' });
            }}
          >
            <Plus size={16} />
            Tạo mới
          </Button>
        }
      />

      <Card className="toolbar-card">
        <div className="search-box">
          <Search size={16} />
          <Input placeholder="Tìm sample..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <Select value={productTypeId} onChange={(event) => setProductTypeId(event.target.value)}>
          <option value="all">Tất cả loại sản phẩm</option>
          {productTypes.data?.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </Select>
      </Card>

      <div className="split-grid">
        <Card className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mẫu</th>
                <th>Loại sản phẩm</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {samples.isLoading ? <LoadingRows columns={5} /> : null}
              {!samples.isLoading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState title="Không có sample phù hợp" />
                  </td>
                </tr>
              ) : null}
              {filtered.map((row) => (
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
                  <td>{row.productType?.name || productTypes.data?.find((type) => type.id === row.productTypeId)?.name || row.productTypeId}</td>
                  <td>
                    <Badge tone={row.isActive === false ? 'muted' : 'success'}>{row.isActive === false ? 'Ẩn' : 'Hiển thị'}</Badge>
                  </td>
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
          <h2>{editing ? 'Sửa sample' : 'Tạo sample'}</h2>
          <form className="form-stack" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div>
              <Label htmlFor="productTypeId">Loại sản phẩm</Label>
              <Select id="productTypeId" {...form.register('productTypeId')}>
                <option value={0}>Chọn loại sản phẩm</option>
                {productTypes.data?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
              {form.formState.errors.productTypeId ? (
                <small className="form-error">{form.formState.errors.productTypeId.message}</small>
              ) : null}
            </div>
            <div>
              <Label htmlFor="name">Tên sample</Label>
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
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
