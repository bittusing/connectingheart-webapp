type TestimonialCardProps = {
  quote: string
  couple: string
  location: string
  year: string
}

export const TestimonialCard = ({
  quote,
  couple,
  location,
  year,
}: TestimonialCardProps) => (
  <article className="glass-panel h-full space-y-4">
    <p className="text-lg font-medium text-slate-900 dark:text-white">
      “{quote}”
    </p>
    <div className="pt-4 text-sm text-slate-600 dark:text-slate-300">
      <p className="font-semibold text-slate-900 dark:text-white">{couple}</p>
      <p>
        {location} · {year}
      </p>
    </div>
  </article>
)

