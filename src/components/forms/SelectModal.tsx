import { useEffect, useMemo, useState } from 'react'
import { Button } from '../common/Button'

type SelectModalProps = {
  title: string
  options: string[]
  isOpen: boolean
  selected?: string
  onClose: () => void
  onConfirm: (value: string) => void
  searchable?: boolean
}

export const SelectModal = ({
  title,
  options,
  isOpen,
  selected,
  onClose,
  onConfirm,
  searchable = true,
}: SelectModalProps) => {
  const [query, setQuery] = useState('')
  const [tempValue, setTempValue] = useState(selected ?? '')

  useEffect(() => {
    if (isOpen) {
      setTempValue(selected ?? '')
      setQuery('')
    }
  }, [isOpen, selected])

  const filteredOptions = useMemo(() => {
    if (!query) return options
    return options.filter((option) =>
      option.toLowerCase().includes(query.toLowerCase()),
    )
  }, [options, query])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {searchable && (
          <input
            className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500"
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        )}
        <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-2">
          {filteredOptions.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
            >
              <input
                type="radio"
                name={title}
                value={option}
                checked={tempValue === option}
                onChange={() => setTempValue(option)}
              />
              {option}
            </label>
          ))}
          {filteredOptions.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">
              No options found
            </p>
          )}
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            className="text-sm font-semibold text-slate-500 hover:text-slate-700"
            onClick={() => {
              setQuery('')
              setTempValue(selected ?? '')
              onClose()
            }}
          >
            Cancel
          </button>
          <Button
            size="md"
            onClick={() => {
              if (tempValue) {
                onConfirm(tempValue)
                setQuery('')
                onClose()
              }
            }}
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  )
}

