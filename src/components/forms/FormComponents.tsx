import { useState } from 'react'
import { Button } from '../common/Button'

export const ToggleGroup = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) => (
  <div className="space-y-3">
    <p className="text-sm font-medium text-slate-700">{label}</p>
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-full border px-4 py-2 text-sm font-medium ${
            value === option
              ? 'border-pink-500 bg-pink-50 text-pink-600'
              : 'border-slate-200 text-slate-500'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
)

export const MultiSelectChips = ({
  label,
  options,
  values,
  onToggle,
}: {
  label: string
  options: string[]
  values: string[]
  onToggle: (value: string) => void
}) => (
  <div className="space-y-3">
    <p className="text-sm font-medium text-slate-700">{label}</p>
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const active = values.includes(option)
        return (
          <button
            type="button"
            key={option}
            onClick={() => onToggle(option)}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              active
                ? 'border-pink-500 bg-pink-50 text-pink-600'
                : 'border-slate-200 text-slate-500'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  </div>
)

export const SelectButton = ({
  label,
  value,
  placeholder,
  onClick,
  disabled,
}: {
  label: string
  value?: string
  placeholder: string
  onClick: () => void
  disabled?: boolean
}) => (
  <label className="space-y-2 text-left">
    <span className="block text-sm font-medium text-slate-700">{label}</span>
    <button
      type="button"
      className={`flex w-full items-center justify-between rounded-2xl border bg-slate-50 px-4 py-3 text-sm transition ${
        disabled
          ? 'cursor-not-allowed border-slate-200 text-slate-400 opacity-60'
          : 'border-slate-200 text-slate-900 shadow-inner hover:border-pink-200'
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {value ? (
        <span className="text-slate-900">{value}</span>
      ) : (
        <span className="text-slate-400">{placeholder}</span>
      )}
      <span className="text-slate-300">⌄</span>
    </button>
  </label>
)

export const CountSelector = ({
  label,
  value,
  max = 4,
  onChange,
}: {
  label: string
  value: number
  max?: number
  onChange: (value: number) => void
}) => (
  <div className="space-y-2">
    <p className="text-sm font-medium text-slate-700">{label}</p>
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: max + 1 }, (_, index) => index).map((count) => (
        <button
          type="button"
          key={count}
          onClick={() => onChange(count)}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            value === count
              ? 'bg-pink-500 text-white'
              : 'border border-slate-200 text-slate-500'
          }`}
        >
          {count === 0 ? 'None' : count}
        </button>
      ))}
    </div>
  </div>
)

export const UploadDropzone = ({
  label,
  value,
  onClick,
}: {
  label: string
  value?: string
  onClick: () => void
}) => (
  <div className="space-y-2">
    <p className="text-sm font-medium text-slate-700">{label}</p>
    <button
      type="button"
      onClick={onClick}
      className="flex h-48 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500"
    >
      {value ? (
        <span className="font-semibold text-slate-900">{value}</span>
      ) : (
        <>
          <span className="text-2xl text-pink-500">＋</span>
          <span>Upload</span>
        </>
      )}
    </button>
  </div>
)

export const CounterTextarea = ({
  label,
  value,
  onChange,
  maxLength,
}: {
  label: string
  value: string
  onChange: (next: string) => void
  maxLength: number
}) => (
  <label className="space-y-2">
    <span className="block text-sm font-medium text-slate-700">{label}</span>
    <textarea
      rows={4}
      value={value}
      onChange={(event) => onChange(event.target.value.slice(0, maxLength))}
      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500"
      placeholder="Tell us about yourself"
    />
    <span className="block text-right text-xs text-slate-400">
      {value.length} / {maxLength}
    </span>
  </label>
)

export const FileUploadModal = ({
  open,
  title,
  onClose,
  onUpload,
}: {
  open: boolean
  title: string
  onClose: () => void
  onUpload: (fileName: string) => void
}) => {
  const [fileName, setFileName] = useState('')
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <input
          type="file"
          className="mt-4 w-full text-sm"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
        />
        <Button
          className="mt-4 w-full"
          disabled={!fileName}
          onClick={() => {
            if (fileName) {
              onUpload(fileName)
              setFileName('')
            }
          }}
        >
          Upload image
        </Button>
        <button
          type="button"
          className="mt-3 w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
          onClick={() => {
            setFileName('')
            onClose()
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
