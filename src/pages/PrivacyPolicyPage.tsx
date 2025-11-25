type DetailList = {
  title?: string
  description: string
}

const collectedInformation: DetailList[] = [
  {
    description:
      'Connecting Hearts, an advertising-led matchmaking platform, requests personal details so we can publish your profile and deliver tailored recommendations. By using the service you consent to the collection, processing, and sharing of this information in line with this policy.',
  },
  {
    title: 'Information you submit',
    description: 'Profile data, preferences, photos, and communications you voluntarily provide.',
  },
  {
    title: 'Information not directly submitted by you',
    description: 'App activity, device diagnostics, and technical identifiers captured automatically.',
  },
  {
    title: 'Information we receive from others',
    description: 'Details shared by other members or third parties to keep our platform safe and compliant.',
  },
]

const serviceEnrollmentDetails: string[] = [
  'Personal details such as name, gender, date of birth, education, occupation, photos, marital status, and interests shared during registration.',
  'Payment information (debit/credit card or UPI) submitted directly or through our payment gateway while purchasing paid services.',
  'Testimonials, success stories, and photos voluntarily submitted for publication.',
  'Responses provided during surveys, contests, promotions, or community events.',
  'Details and recordings shared with our customer care team for quality assurance and support.',
  'Chats, messages, and user-generated content exchanged with other members on the platform.',
  'Reports of suspicious IDs; immediate legal action is taken if violations are confirmed.',
]

const indirectInformation: DetailList[] = [
  {
    title: 'User activity',
    description:
      'Timestamps, feature usage, searches, clicks, visited pages, and interactions with other users (including exchanged messages).',
  },
  {
    title: 'Device information',
    description:
      'IP address, device IDs, device specifications, app/browser settings, crash logs, operating system details, and identifiers associated with cookies or similar technologies.',
  },
  {
    title: 'SMS permission',
    description: 'Required solely to authenticate transactions via OTP issued by payment gateways.',
  },
]

const usagePurposes: string[] = [
  'Provide, personalize, and improve the core matchmaking services.',
  'Manage your account lifecycle and preferences.',
  'Deliver responsive customer support.',
  'Conduct research, reporting, and service quality analysis.',
  'Communicate about product updates, promotions, and relevant offers.',
  'Recommend compatible profiles and showcase your profile to other members.',
]

const sharingPractices: DetailList[] = [
  {
    title: 'With other users',
    description:
      'Your published profile information is visible to fellow members. Always review and limit what you share publicly.',
  },
  {
    title: 'With service providers and partners',
    description:
      'Trusted third parties assist with development, hosting, storage, analytics, and payments. They operate under strict contractual and confidentiality obligations.',
  },
  {
    title: 'With law enforcement',
    description:
      'Personal data may be disclosed to comply with applicable laws, court orders, or to protect the rights and safety of our members and platform.',
  },
]

const privacyRights: DetailList[] = [
  {
    title: 'Reviewing your information',
    description:
      'Depending on your jurisdiction, you may have the right to access or port the personal data we hold.',
  },
  {
    title: 'Deletion',
    description:
      'You can delete your profile if you believe we no longer need your information. Certain records may be retained for legal or transactional reasons.',
  },
  {
    title: 'Information from other users',
    description:
      'Requests for another member’s communications require that member’s written consent before release.',
  },
  {
    title: 'Withdraw consent',
    description:
      'You may withdraw consent at any time. Doing so deletes your profile and limits our ability to provide further services.',
  },
]

const securityHighlights: string[] = [
  'Sensitive inputs, including payment card details, are encrypted during transmission and handled by PCI-compliant providers.',
  'Access to personal data is restricted to employees who need it to perform their duties.',
  'Industry-standard safeguards mitigate unauthorized access; however, no system is completely impenetrable given the nature of the internet.',
]

export const PrivacyPolicyPage = () => {
  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Your privacy matters to us. This policy explains what we collect, how we use it, and the
          controls you have while using Connecting Hearts.
        </p>
      </header>

      <article className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          What information does Connecting Hearts collect?
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {collectedInformation.map((item) => (
            <div key={item.title ?? item.description}>
              {item.title && <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>}
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Information you provide to avail the service
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {serviceEnrollmentDetails.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Information not directly submitted by you</h2>
        {indirectInformation.map((item) => (
          <div key={item.title}>
            <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.description}</p>
          </div>
        ))}
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          In addition, we may receive supporting details about you from external sources to comply with security,
          compliance, and fraud-prevention requirements.
        </p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">How we use collected information</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {usagePurposes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">With whom we share your information</h2>
        {sharingPractices.map((item) => (
          <div key={item.title}>
            <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.description}</p>
          </div>
        ))}
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          We do not sell or trade your personal data. Sharing occurs only as described above or when you are expressly
          informed and provide consent.
        </p>
      </article>

      <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">How to access or control your information</h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Manage your information directly from your account dashboard. EU members and other applicable jurisdictions
          may exercise the following rights:
        </p>
        <div className="space-y-3">
          {privacyRights.map((item) => (
            <div key={item.title}>
              <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          To protect all members, we may request proof of identity before honoring privacy requests.
        </p>
      </article>

      <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">How we secure your information</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {securityHighlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Have questions about security? Reach us at{' '}
          <a className="text-pink-600 underline dark:text-pink-400" href="mailto:connectinghearts.helpdesk@gmail.com">
            connectinghearts.helpdesk@gmail.com
          </a>
          .
        </p>
      </article>

      <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">How long we keep your information</h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          We retain personal information only for as long as you maintain an account and as required by applicable laws.
          When you delete your profile, we delete or anonymize associated data unless retention is necessary to comply
          with legal obligations, prevent fraud, resolve disputes, enforce agreements, or support business operations.
        </p>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Aggregated insights may be used to improve our services, but they no longer identify you personally.
        </p>
      </article>
    </section>
  )
}

