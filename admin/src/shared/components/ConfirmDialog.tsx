import { AlertTriangle } from 'lucide-react';
import { Button } from './ui';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Xác nhận',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="modal-icon modal-icon--danger">
          <AlertTriangle size={20} />
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p>{description}</p>
        <div className="modal-actions">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
