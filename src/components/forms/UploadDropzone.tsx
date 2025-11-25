type UploadDropzoneProps = {
  label: string
  required?: boolean
  value?: { name: string; preview?: string } | null
  onClick: () => void
}

export const UploadDropzone = ({ label, required, value, onClick }: UploadDropzoneProps) => (
  <div className="space-y-2">
    <p className="text-sm font-medium text-slate-700">
      {label} {required && <span className="text-pink-500">*</span>}
    </p>
    <button
      type="button"
      onClick={onClick}
      className="flex h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white text-sm text-slate-500 transition hover:border-pink-400 hover:text-pink-500"
    >
      {value?.preview ? (
        <img
          src={value.preview}
          alt={value.name}
          className="h-full w-full rounded-2xl object-cover"
        />
      ) : (
        <>
          <span className="text-3xl">＋</span>
          <span className="mt-2 font-semibold">Upload</span>
          <span className="text-xs text-slate-400">
            {value?.name ?? 'JPG, PNG up to 5MB'}
          </span>
        </>
      )}
    </button>
  </div>
)

