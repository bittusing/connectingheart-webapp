import { statTiles } from '../../data/dashboardContent'

export const StatsGrid = () => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {statTiles.map((tile) => (
      <div
        key={tile.label}
        className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:border-pink-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="relative z-10">
          <p className="text-4xl font-bold text-slate-900 transition-colors group-hover:text-pink-600 dark:text-white">
            {tile.value}
          </p>
          <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {tile.label}
          </p>
          {tile.description && (
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{tile.description}</p>
          )}
        </div>
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-pink-100 opacity-0 transition-opacity group-hover:opacity-20 dark:bg-pink-900/20"></div>
      </div>
    ))}
  </div>
)

