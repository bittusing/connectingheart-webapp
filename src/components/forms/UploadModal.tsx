import { useRef, useState } from 'react'

type UploadInfo = {
  name: string
  preview?: string
}

type UploadModalProps = {
  open: boolean
  title: string
  onClose: () => void
  onUpload: (info: UploadInfo) => void
}

export const UploadModal = ({ open, title, onClose, onUpload }: UploadModalProps) => {
  const [fileName, setFileName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () =>
      onUpload({
        name: file.name,
        preview: typeof reader.result === 'string' ? reader.result : undefined,
      })
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="mt-4 w-full text-sm"
          onChange={handleFileChange}
        />
        <p className="mt-2 text-sm text-slate-500">
          {fileName ? `Selected: ${fileName}` : 'Choose a JPG/PNG under 5MB.'}
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            className="text-sm font-semibold text-slate-500 hover:text-slate-700"
            onClick={() => {
              setFileName('')
              if (inputRef.current) inputRef.current.value = ''
              onClose()
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-400"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

