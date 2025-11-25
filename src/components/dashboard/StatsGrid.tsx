import { useNavigate } from 'react-router-dom'
import type { StatTile } from '../../types/dashboard'

type StatsGridProps = {
  tiles: StatTile[]
}

export const StatsGrid = ({ tiles }: StatsGridProps) => {
  const navigate = useNavigate()

  const handleTileClick = (tile: StatTile) => {
    if (tile.onClick) {
      tile.onClick()
    } else if (tile.href) {
      navigate(tile.href)
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => {
        const isClickable = tile.href || tile.onClick
        const Component = isClickable ? 'button' : 'div'

        return (
          <Component
            key={tile.label}
            onClick={() => isClickable && handleTileClick(tile)}
            className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all dark:border-slate-700 dark:bg-slate-800 ${
              isClickable
                ? 'cursor-pointer hover:border-pink-200 hover:shadow-lg'
                : 'hover:border-pink-200 hover:shadow-lg'
            }`}
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
          </Component>
        )
      })}
    </div>
  )
}

