'use client';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  body = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
}: {
  open: boolean;
  title?: string;
  body?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[99] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-md border bg-[hsl(var(--card))] p-4 shadow-soft">
        <div className="text-lg font-semibold">{title}</div>
        <div className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{body}</div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onClose}>{cancelText}</button>
          <button className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}