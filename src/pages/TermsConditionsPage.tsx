type BulletSection = {
  title: string
  description?: string
  bullets: string[]
}

const introParagraphs = [
  'This document is an electronic record pursuant to the Information Technology Act, 2000 and related rules. It is generated electronically and does not require physical signatures.',
  'Published in accordance with Rule 3(1) of the Information Technology (Intermediaries Guidelines) Rules, 2011, these Terms govern access and use of Connecting Hearts.',
  'By accessing, browsing, or using the application you agree to be bound by this agreement, including referenced policies as updated from time to time. If you disagree, please discontinue using Connecting Hearts immediately.',
  '“Connecting Hearts member”, “You”, or “User” refers to anyone accessing the service for themselves or on behalf of a registrant (such as a friend or family member). Connecting Hearts (CIN: U93090UP2020PTC133241) operates from Plot No. CN-21 IIM Road, Allu Nagar Diguria, Lucknow 226020.',
]

const scopeParagraphs = [
  'Connecting Hearts operates as an intermediary under Section 2(1)(w) of the Information Technology Act, 2000.',
  'We provide an online platform where users with valid mobile numbers and email IDs can register, manage profiles, and seek lawful matrimonial matches based on language, region, and stated partner preferences.',
  'Members receive free or paid access to search, shortlist, and communicate with prospects aligned to their chosen criteria.',
]

const eligibilityBullets = [
  'Women must be at least 18 years old and men at least 21 years old.',
  'Applicants awaiting divorce may register by disclosing “Awaiting Divorce”.',
  'International users must be legally permitted to marry in their jurisdiction and comply with applicable Indian laws.',
  'Registrants creating profiles for others confirm they have obtained the necessary consent.',
  'Membership is reserved for genuine individuals seeking marriage; businesses or competitors may not enroll or harvest data.',
]

const registrationParagraphs = [
  'Provide accurate, current, and complete information, including recent photographs, during registration. Fill only the appropriate fields and avoid duplicating data.',
  'Connecting Hearts may request additional documentation to serve you better; please cooperate promptly.',
  'If any information is found to be untrue, inaccurate, or incomplete, we may suspend or terminate your membership without notice, forfeit payments, and block duplicate or non-compliant profiles.',
  'Use of the platform signifies a bona fide intent for marriage. Unauthorized commercial use, data scraping, or profile replication is prohibited.',
]

const accountSecurityParagraphs = [
  'You are responsible for safeguarding your login credentials, OTPs, and device access. We will never request your password.',
  'You are liable for all activities conducted through your account and must notify us of any unauthorized access.',
]

const companyRoleBullets = [
  'Display member profiles “as-is” for discovery by other registered users.',
  'Provide an interface for self-service searching without personal matchmaking assistance.',
  'Generate automated matches based on the partner preferences you set; changes to preferences will update recommendations accordingly.',
  'Protect sensitive information via industry security standards, acknowledging that no transmission is entirely risk-free.',
  'Refrain from authenticating every profile; members must independently verify details before proceeding.',
]

const memberResponsibilitiesBullets = [
  'Create strong passwords, keep contact details current, and provide recent photographs and relevant health disclosures.',
  'Verify the credentials, intentions, and backgrounds of prospects before sharing personal data or progressing conversations.',
  'Avoid financial transactions, abusive language, discrimination, or sharing confidential details (banking, IDs, etc.) with other members.',
  'Do not enter into physical relationships prior to marriage or violate applicable laws.',
  'Stay vigilant against suspicious behaviour (multiple numbers, refusal to meet, etc.) and report concerns to connectinghearts.helpdesk@gmail.com.',
  'Regularly log in, manage interests, and delete your profile once a match is finalized.',
  'Use secure devices and networks, and never deploy bots, scripts, or vulnerability scans on the application.',
  'Make payments only to official Connecting Hearts accounts; staff will never request direct transfers.',
  'We do not promote horoscope or kundali matching services.',
]

const communicationParagraphs = [
  'By registering, you consent to receive communications via email, calls, SMS, or WhatsApp, including promotional updates.',
  'Automated systems may send you prospective profiles. Provide contact numbers not registered under Do Not Disturb, or acknowledge that Connecting Hearts calls/messages will not be considered promotional.',
]

const confidentialityParagraphs = [
  'Feedback submitted to Connecting Hearts is deemed non-confidential, and we may use it without restriction. By providing feedback, you confirm you own the content and understand no compensation is due.',
]

const disputesParagraphs = [
  'Members are solely responsible for communications and transactions with prospects. Connecting Hearts is not liable for disputes, financial exchanges, or misrepresentations between users.',
  'We are not brokers or agents and do not mediate conversations or guarantee outcomes.',
]

const liabilityParagraphs = [
  'Connecting Hearts, SRCM/Heartfulness, and their representatives are not liable for direct or indirect damages arising from use of the app, third-party services, or user interactions.',
  'Exchange of profiles does not constitute a matrimonial offer or guarantee. Liability, if any, is limited to the amount paid for the specific service package.',
  'We are not responsible for financial transactions between members, lack of responses, improper matches, or technical issues.',
  'Members agree not to initiate or participate in class actions or class arbitration against Connecting Hearts or SRCM/Heartfulness.',
]

const generalParagraphs = [
  'Submitting false complaints that impact other users may result in legal action, suspension, and forfeiture of fees.',
  'We may delete or suspend content that violates consent, accuracy, or prevailing laws, including obscene, defamatory, or discriminatory material.',
  'Offensive behaviour toward staff or members may lead to account suspension.',
  'Unutilized call/SMS quotas expire with membership unless renewed within 30 days, after which remaining balances resume.',
  'In case of conflict between these Terms and other site policies, these Terms prevail for in-app services.',
]

const disclaimerParagraphs = [
  'Services are provided on an “as-is” and “as-available” basis without warranties of merchantability, fitness, or non-infringement.',
  'We do not guarantee virus-free servers or uninterrupted availability, nor do we promise marriage outcomes.',
  'We are not responsible for actions of payment gateways, inaccurate user information, decisions based on shared data, unauthorized third-party acts, cybercrimes, force majeure events, or technical malfunctions.',
  'Use of the app is at your own risk. We are not liable for any damage to your devices arising from installation or use.',
  'Register with a mobile number not tied to critical financial services to mitigate risk; we are not liable for misuse of shared devices or accounts.',
]

const indemnityParagraphs = [
  'By using Connecting Hearts you agree to indemnify and hold harmless the company, its affiliates, officers, employees, and partners from losses or claims arising from misuse of the service. This obligation survives termination of membership.',
]

const bulletSections: BulletSection[] = [
  {
    title: 'Eligibility',
    bullets: eligibilityBullets,
  },
]

const detailedBulletSections: BulletSection[] = [
  {
    title: 'Role & Responsibility of Connecting Hearts',
    description:
      'Our obligations focus on platform facilitation, data security practices, and transparent communication with members.',
    bullets: companyRoleBullets,
  },
  {
    title: 'Role & Responsibility of Connecting Hearts Members',
    description: 'Members must uphold safe usage practices and comply fully with these Terms.',
    bullets: memberResponsibilitiesBullets,
  },
]

const sectionClass =
  'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'

export const TermsConditionsPage = () => {
  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
          Terms & Conditions
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Review the legally binding terms that govern your use of Connecting Hearts.
        </p>
      </header>

      <article className={sectionClass}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Acceptance of Terms</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {introParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <article className={sectionClass}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Scope</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {scopeParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      {bulletSections.map((section) => (
        <article key={section.title} className={sectionClass}>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{section.title}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {section.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </article>
      ))}

      <article className={sectionClass}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Registration</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {registrationParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <article className={sectionClass}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Account Security</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {accountSecurityParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      {detailedBulletSections.map((section) => (
        <article key={section.title} className={sectionClass}>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{section.title}</h2>
          {section.description && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{section.description}</p>
          )}
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {section.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </article>
      ))}

      <article className={sectionClass}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Communication & Notifications
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {communicationParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <article className={sectionClass}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Confidentiality</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {confidentialityParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <article className={sectionClass}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Privacy of Membership</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Your use of the platform is governed by our Privacy Policy. Personal data shared with us is treated in
          accordance with that policy and applicable laws. If you object to data handling practices described there, do
          not use the application.
        </p>
      </article>

      <article className={sectionClass}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Disputes Between Members</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {disputesParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <article className={sectionClass}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Limitation of Liability</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {liabilityParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <article className={sectionClass}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">General</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {generalParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <article className={sectionClass}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Disclaimer</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {disclaimerParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <article className={sectionClass}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Indemnity</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {indemnityParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </section>
  )
}

