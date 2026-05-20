import { Calculator, DatabaseZap } from 'lucide-react';
import { Card, EmptyState, PageHeader, Badge } from '@/shared/components/ui';

export function PriceManagementPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Pricing Data"
        description="Backend hiện có API tính giá public, nhưng chưa có API admin để quản lý bảng giá."
      />

      <div className="dashboard-grid">
        <Card className="status-card">
          <h2>
            <Calculator size={18} />
            API hiện có
          </h2>
          <div className="status-list">
            <div>
              <span>Tính giá</span>
              <Badge tone="success">POST /price/calculate</Badge>
            </div>
            <div>
              <span>CRUD price grids</span>
              <Badge tone="warning">Chưa có controller</Badge>
            </div>
            <div>
              <span>CRUD base prices</span>
              <Badge tone="warning">Chưa có controller</Badge>
            </div>
            <div>
              <span>CRUD dimensions/material/effect</span>
              <Badge tone="warning">Chưa có controller</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="empty-with-icon">
            <DatabaseZap size={34} />
            <EmptyState
              title="Cần bổ sung API trước khi làm CRUD bảng giá"
              description="Admin app không tạo mock cố định cho dữ liệu giá. Danh sách endpoint cần thêm nằm trong ADMIN_API_REQUIREMENTS.md."
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
