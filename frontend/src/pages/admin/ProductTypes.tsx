import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { slugify } from '@/lib/utils';

export default function AdminProductTypes() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });

  const { data: types = [] } = useQuery({ queryKey: ['admin-product-types'], queryFn: adminApi.getProductTypes });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editing ? adminApi.updateProductType(editing.id, data) : adminApi.createProductType(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-product-types'] }); toast({ title: '✅ Lưu thành công' }); setOpen(false); },
    onError: (err: any) => toast({ title: err?.response?.data?.message || 'Lỗi', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteProductType,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-product-types'] }); toast({ title: '✅ Đã xóa' }); },
    onError: () => toast({ title: 'Xóa thất bại', variant: 'destructive' }),
  });

  const openCreate = () => { setEditing(null); setForm({ name: '', slug: '', description: '' }); setOpen(true); };
  const openEdit = (pt: any) => { setEditing(pt); setForm({ name: pt.name, slug: pt.slug, description: pt.description || '' }); setOpen(true); };

  return (
    <>
      <SEOHead title="Quản lý loại sản phẩm" noindex />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Loại sản phẩm</h1>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Thêm mới</Button>
        </div>
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Tên</TableHead><TableHead>Slug</TableHead><TableHead>Trạng thái</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {types.map((pt: any) => (
                <TableRow key={pt.id}>
                  <TableCell className="font-medium">{pt.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm font-mono">{pt.slug}</TableCell>
                  <TableCell><Badge variant={pt.isActive ? 'default' : 'secondary'}>{pt.isActive ? 'Hiển thị' : 'Ẩn'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(pt)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (confirm('Xóa loại sản phẩm này?')) deleteMutation.mutate(pt.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Sửa loại sản phẩm' : 'Thêm loại sản phẩm'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tên loại sản phẩm</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} placeholder="Huy hiệu tròn" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="huy-hieu-tron" />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
