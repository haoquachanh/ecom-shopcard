import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { slugify } from '@/lib/utils';

export default function AdminSamples() {
  const qc = useQueryClient();
  const [selectedPtId, setSelectedPtId] = useState<string>('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    productTypeId: '',
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    thumbnailUrl: '',
    tagsString: '',
    isActive: true,
  });

  const { data: types = [] } = useQuery({
    queryKey: ['admin-product-types'],
    queryFn: adminApi.getProductTypes,
  });

  const { data: samples = [], isLoading } = useQuery({
    queryKey: ['admin-samples', selectedPtId],
    queryFn: () => adminApi.getSamples(selectedPtId !== 'all' ? +selectedPtId : undefined),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      editing ? adminApi.updateSample(editing.id, data) : adminApi.createSample(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-samples'] });
      toast({ title: '✅ Lưu mẫu thiết kế thành công' });
      setOpen(false);
    },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message || 'Lỗi lưu mẫu', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteSample,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-samples'] });
      toast({ title: '✅ Đã xóa mẫu thiết kế' });
    },
    onError: () => {
      toast({ title: 'Xóa mẫu thất bại', variant: 'destructive' });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      productTypeId: types[0]?.id?.toString() || '',
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      thumbnailUrl: '',
      tagsString: '',
      isActive: true,
    });
    setOpen(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      productTypeId: s.productTypeId.toString(),
      name: s.name,
      slug: s.slug,
      description: s.description || '',
      imageUrl: s.imageUrl || '',
      thumbnailUrl: s.thumbnailUrl || '',
      tagsString: (s.tags || []).join(', '),
      isActive: s.isActive,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.productTypeId) {
      toast({ title: 'Vui lòng điền đủ thông tin bắt buộc', variant: 'destructive' });
      return;
    }

    const payload = {
      productTypeId: +form.productTypeId,
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      imageUrl: form.imageUrl || undefined,
      thumbnailUrl: form.thumbnailUrl || undefined,
      tags: form.tagsString
        ? form.tagsString
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      isActive: form.isActive,
    };

    saveMutation.mutate(payload);
  };

  return (
    <>
      <SEOHead title="Quản lý mẫu thiết kế" noindex />
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Mẫu thiết kế</h1>
          <div className="flex items-center gap-3">
            <Select value={selectedPtId} onValueChange={setSelectedPtId}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Lọc theo loại sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại sản phẩm</SelectItem>
                {types.map((t: any) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm mới
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Ảnh</TableHead>
                <TableHead>Tên mẫu</TableHead>
                <TableHead>Loại sản phẩm</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : samples.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Chưa có mẫu thiết kế nào
                  </TableCell>
                </TableRow>
              ) : (
                samples.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <img
                        src={s.thumbnailUrl || s.imageUrl || 'https://placehold.co/50x50'}
                        alt={s.name}
                        className="h-10 w-10 object-cover rounded-lg bg-muted"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{s.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>{s.productType?.name || s.productTypeId}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(s.tags || []).map((t: string) => (
                          <Badge key={t} variant="outline" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.isActive ? 'default' : 'secondary'}>
                        {s.isActive ? 'Hiển thị' : 'Ẩn'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm('Xóa mẫu thiết kế này?')) deleteMutation.mutate(s.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa mẫu thiết kế' : 'Thêm mẫu thiết kế'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Loại sản phẩm</Label>
                <Select
                  value={form.productTypeId}
                  onValueChange={(v) => setForm({ ...form, productTypeId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại sản phẩm" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t: any) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tên mẫu thiết kế</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: slugify(e.target.value),
                    })
                  }
                  placeholder="Hu Tao chibi"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="hu-tao-chibi"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Mô tả mẫu</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Standee Hu Tao bản chibi xinh xắn..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Image URL (Ảnh gốc / Ảnh lớn)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://imgur.com/..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Thumbnail URL (Ảnh nhỏ)</Label>
              <Input
                value={form.thumbnailUrl}
                onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                placeholder="https://imgur.com/..._thumb"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tags (ngăn cách bằng dấu phẩy)</Label>
              <Input
                value={form.tagsString}
                onChange={(e) => setForm({ ...form, tagsString: e.target.value })}
                placeholder="anime, genshin, cute"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Hiển thị mẫu này trên trang chủ
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
