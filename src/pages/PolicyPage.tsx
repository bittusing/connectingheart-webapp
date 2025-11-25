const policies = [
  {
    title: 'Data privacy',
    body:
      'All personally identifiable information is encrypted at rest. Phone numbers, documents, and chat transcripts stay hidden until both parties consent to share.',
  },
  {
    title: 'Profile verification',
    body:
      'We follow a three-layer KYC process (ID proof, selfie video, and human review). Suspicious profiles are auto-flagged and escalated to the trust & safety pod.',
  },
  {
    title: 'Payment & refunds',
    body:
      'Membership charges (₹499 / ₹799 / ₹999) unlock platform-wide access for their duration. Direct course or feature purchases stay active for one year, aligned with monetization rules shared earlier.',
  },
  {
    title: 'Community standards',
    body:
      'Respectful, harassment-free communication is mandatory. Report buttons are embedded across the product and route directly to moderators within 6 hours.',
  },
]

export const PolicyPage = () => (
  <section className="section-shell space-y-10">
    <div className="space-y-4 text-center">
      <p className="pill mx-auto">Policies & trust</p>
      <h1 className="font-display text-4xl font-semibold text-slate-900 dark:text-white">
        Transparent, human-centered safeguards.
      </h1>
      <p className="text-base text-slate-600 dark:text-slate-300">
        These summaries mirror the ConnectingHeart policy flow. Swap this static
        content with markdown pulled from your CMS/API after integration.
      </p>
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      {policies.map((policy) => (
        <article key={policy.title} className="glass-panel space-y-3 text-left">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {policy.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {policy.body}
          </p>
        </article>
      ))}
    </div>
    <div className="glass-panel space-y-3 text-sm text-slate-500 dark:text-slate-300">
      <p>
        Need edits or legal copy approval? Drop a note to{' '}
        <a className="font-semibold text-brand-500" href="mailto:legal@connectingheart.co">
          legal@connectingheart.co
        </a>
        . We keep UI static until we fetch policy sections from the backend CMS
        via the shared API hook.
      </p>
    </div>
  </section>
)

