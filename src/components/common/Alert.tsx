import { InformationCircleIcon } from '@heroicons/react/24/outline'

type AlertProps = {
  message: string
  onConfirm: () => void
  className?: string
}

export const Alert = ({ message, onConfirm, className }: AlertProps) => {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 ${className ?? ''}`}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-6 w-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">www.connectingheart.co says</h3>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-lg bg-amber-700 px-6 py-2 text-sm font-medium text-white transition hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

