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
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { formatVND } from '@/lib/utils';

export default function AdminPriceGrids() {
  const qc = useQueryClient();
  const [selectedPtId, setSelectedPtId] = useState('');
  const [gridOpen, setGridOpen] = useState(false);
  const [editGrid, setEditGrid] = useState<any>(null);
  const [gridForm, setGridForm] = useState({ priceTierId: '', materialCode: '', gridDataRaw: '' });

  const { data: types = [] } = useQuery({ queryKey: ['admin-product-types'], queryFn: adminApi.getProductTypes });
  const { data: tiers = [] } = useQuery({ queryKey: ['admin-tiers', selectedPtId], queryFn: () => adminApi.getTiers(+selectedPtId), enabled: !!selectedPtId });
  const { data: grids = [] } = useQuery({ queryKey: ['admin-grids', selectedPtId], queryFn: () => adminApi.getGrids(+selectedPtId), enabled: !!selectedPtId });

  const saveGridMutation = useMutation({
    mutationFn: (data: any) => editGrid ? adminApi.updateGrid(editGrid.id, data) : adminApi.createGrid(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-grids'] }); toast({ title: '✅ Lưu bảng giá thành công' }); setGridOpen(false); },
    onError: (err: any) => toast({ title: err?.response?.data?.message || 'Lỗi JSON', variant: 'destructive' }),
  });

  const deleteGridMutation = useMutation({
    mutationFn: adminApi.deleteGrid,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-grids'] }),
  });

  const openCreate = () => {
    setEditGrid(null);
    setGridForm({ priceTierId: tiers[0]?.id?.toString() || '', materialCode: '', gridDataRaw: JSON.stringify({ rows: [{ quantity: '20', values: { '5cm': 6000, '7cm': 9000 } }] }, null, 2) });
    setGridOpen(true);
  };

  const openEdit = (g: any) => {
    setEditGrid(g);
    setGridForm({ priceTierId: String(g.priceTierId), materialCode: g.materialCode || '', gridDataRaw: JSON.stringify(g.gridData, null, 2) });
    setGridOpen(true);
  };

  const handleSaveGrid = () => {
    try {
      const gridData = JSON.parse(gridForm.gridDataRaw);
      saveGridMutation.mutate({ productTypeId: +selectedPtId, priceTierId: +gridForm.priceTierId, materialCode: gridForm.materialCode || null, gridData });
    } catch {
      toast({ title: 'JSON không hợp lệ', variant: 'destructive' });
    }
  };

  return (
    <>
      <SEOHead title="Quản lý bảng giá" noindex />
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Bảng giá</h1>
        <div className="flex items-center gap-3">
          <Select value={selectedPtId} onValueChange={setSelectedPtId}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Chọn loại sản phẩm" /></SelectTrigger>
            <SelectContent>{types.map((t: any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
          {selectedPtId && <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Thêm bảng giá</Button>}
        </div>

        {selectedPtId && (
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Tier</TableHead><TableHead>Chất liệu</TableHead><TableHead>Số hàng giá</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {grids.map((g: any) => {
                  const tier = tiers.find((t: any) => t.id === g.priceTierId);
                  return (
                    <TableRow key={g.id}>
                      <TableCell>{tier?.displayName || g.priceTierId}</TableCell>
                      <TableCell>{g.materialCode || '–'}</TableCell>
                      <TableCell>{g.gridData?.rows?.length} hàng</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(g)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (confirm('Xóa bảng giá?')) deleteGridMutation.mutate(g.id); }}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={gridOpen} onOpenChange={setGridOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editGrid ? 'Sửa bảng giá' : 'Thêm bảng giá'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Price Tier</Label>
                <Select value={gridForm.priceTierId} onValueChange={(v) => setGridForm({ ...gridForm, priceTierId: v })}>
                  <SelectTrigger><SelectValue placeholder="Chọn tier" /></SelectTrigger>
                  <SelectContent>{tiers.map((t: any) => <SelectItem key={t.id} value={String(t.id)}>{t.displayName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Chất liệu (để trống nếu không có)</Label>
                <Input value={gridForm.materialCode} onChange={(e) => setGridForm({ ...gridForm, materialCode: e.target.value })} placeholder="doubleboard" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Grid Data (JSON)</Label>
              <Textarea value={gridForm.gridDataRaw} onChange={(e) => setGridForm({ ...gridForm, gridDataRaw: e.target.value })} rows={12} className="font-mono text-xs" />
              <p className="text-xs text-muted-foreground">Format: {"{ rows: [{ quantity: '20', values: { '5cm': 6000 } }] }"}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGridOpen(false)}>Hủy</Button>
            <Button onClick={handleSaveGrid} disabled={saveGridMutation.isPending}>Lưu bảng giá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
