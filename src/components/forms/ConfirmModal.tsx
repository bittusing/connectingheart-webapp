import { createPortal } from 'react-dom'

type ConfirmModalProps = {
  open: boolean
  title: string
  description: string
  cancelLabel?: string
  confirmLabel?: string
  onCancel: () => void
  onConfirm: () => void
}

export const ConfirmModal = ({
  open,
  title,
  description,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  onCancel,
  onConfirm,
}: ConfirmModalProps) => {
  if (!open) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-400"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )

  // Render modal at body level using portal to ensure it's on top
  return createPortal(modalContent, document.body)
}

