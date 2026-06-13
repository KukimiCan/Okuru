import { Modal } from "./Modal";

type ConfirmDialogProps = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title = "確認",
  message,
  confirmLabel = "削除する",
  cancelLabel = "キャンセル",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal onClose={onCancel} title={title}>
      <p>{message}</p>
      <div className="action-row">
        <button className="button-danger" onClick={onConfirm} type="button">
          {confirmLabel}
        </button>
        <button className="button-secondary" onClick={onCancel} type="button">
          {cancelLabel}
        </button>
      </div>
    </Modal>
  );
}
