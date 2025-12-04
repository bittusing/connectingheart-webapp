export const HelpCenterPage = () => {
  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-pink-600">Need help?</p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-white">
                Dedicated support for every member
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Reach out anytime for profile assistance, safety concerns, or billing queries. Our
                support desk is available 7 days a week.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Phone</p>
                <a
                  href="tel:+9450312512"
                  className="text-lg font-semibold text-slate-900 transition hover:text-pink-600 dark:text-white"
                >
                  +91-9450312512
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Email</p>
                <a
                  href="mailto:connectinghearts.helpdesk@gmail.com"
                  className="text-lg font-semibold text-slate-900 transition hover:text-pink-600 dark:text-white"
                >
                  connectinghearts.helpdesk@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-700 dark:bg-slate-800">
              <img
                src="/flat-customer-support.png"
                alt="Customer support illustration"
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

