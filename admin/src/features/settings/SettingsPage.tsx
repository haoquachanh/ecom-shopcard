import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, PlugZap } from 'lucide-react';
import { initializeApiClient, getApiBaseUrl, setApiBaseUrl } from '@/shared/api/client';
import { adminApi } from '@/shared/api/adminApi';
import { nativeStore } from '@/shared/api/nativeStore';
import { Badge, Button, Card, Input, Label, PageHeader } from '@/shared/components/ui';
import { useToast } from '@/shared/components/toast';

export function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [version, setVersion] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    nativeStore.getAppVersion().then(setVersion);
    nativeStore.getSettings().then((settings) => setApiUrl(settings.apiBaseUrl));
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await setApiBaseUrl(apiUrl);
      await initializeApiClient();
    },
    onSuccess: () => toast({ title: 'Đã lưu API base URL', tone: 'success' }),
    onError: () => toast({ title: 'Không thể lưu cấu hình', tone: 'error' }),
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      await setApiBaseUrl(apiUrl);
      await initializeApiClient();
      return adminApi.profile();
    },
    onSuccess: () => toast({ title: 'Kết nối API thành công', tone: 'success' }),
    onError: () =>
      toast({
        title: 'Không xác nhận được kết nối',
        description: 'API base URL sai, backend chưa chạy, hoặc token hiện tại không hợp lệ.',
        tone: 'error',
      }),
  });

  return (
    <div className="page-stack">
      <PageHeader
        title="Settings"
        description="Cấu hình kết nối backend online/local và thông tin ứng dụng desktop."
      />

      <div className="settings-grid">
        <Card className="form-card">
          <h2>Backend API</h2>
          <div className="form-stack">
            <div>
              <Label htmlFor="apiUrl">API base URL</Label>
              <Input
                id="apiUrl"
                value={apiUrl}
                placeholder="https://api.example.com"
                onChange={(event) => setApiUrl(event.target.value)}
              />
              <small className="help-text">Ví dụ local: http://localhost:3000. Không hardcode secret trong source code.</small>
            </div>
            <div className="inline-actions">
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                Lưu cấu hình
              </Button>
              <Button variant="outline" onClick={() => testMutation.mutate()} disabled={testMutation.isPending}>
                <PlugZap size={16} />
                Kiểm tra kết nối
              </Button>
            </div>
          </div>
        </Card>

        <Card className="status-card">
          <h2>Application</h2>
          <div className="status-list">
            <div>
              <span>Version</span>
              <Badge tone="default">{version || 'dev'}</Badge>
            </div>
            <div>
              <span>Runtime</span>
              <Badge tone="success">
                <CheckCircle2 size={13} />
                Electron + React
              </Badge>
            </div>
            <div>
              <span>Token storage</span>
              <Badge tone="success">Main process encrypted file</Badge>
            </div>
            <div>
              <span>Renderer security</span>
              <Badge tone="success">contextBridge only</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
