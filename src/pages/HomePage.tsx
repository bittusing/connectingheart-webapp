import { Button } from '../components/common/Button'
import { SectionHeading } from '../components/common/SectionHeading'
import { StatHighlight } from '../components/common/StatHighlight'
import { FeatureCard } from '../components/cards/FeatureCard'
import { TestimonialCard } from '../components/cards/TestimonialCard'
import { StepCard } from '../components/cards/StepCard'
import { CTASection } from '../components/sections/CTASection'
import { PricingCard } from '../components/sections/PricingCard'
import { features, plans, stats, steps, testimonials } from '../data/homeContent'

export const HomePage = () => (
  <>
    <section className="section-shell pt-12" id="discover">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <span className="pill w-fit bg-white/50 text-brand-600">
            Inspired by connectingheart.co
          </span>
          <h1 className="font-display text-4xl font-semibold text-slate-900 dark:text-white sm:text-5xl">
            Find a partner whose story feels like home.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Experience a privacy-first matrimonial platform with curated
            matches, collaborative family tools, and concierge guidance inspired
            by the ConnectingHeart flow, reimagined with a modern UI.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg">Explore profiles</Button>
            <Button size="lg" variant="ghost">
              See how it works
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <StatHighlight key={stat.label} {...stat} />
            ))}
          </div>
        </div>
        <div className="glass-panel relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-glow" />
          <div className="relative space-y-6">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Concierge preview
            </h3>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <p>
                “Hi Riya, based on your preferences we lined up 4 verified
                profiles. Shall we schedule a family video room this Sunday?”
              </p>
              <div className="rounded-2xl bg-white/80 p-4 text-slate-900 shadow-inner dark:bg-slate-900/60 dark:text-white">
                <p className="text-xs uppercase tracking-wide text-brand-500">
                  Next steps
                </p>
                <ul className="mt-3 space-y-2">
                  <li>• Share availability for both families</li>
                  <li>• Upload recent horoscope (optional)</li>
                  <li>• Keep chat private until you approve</li>
                </ul>
              </div>
              <p className="text-xs text-slate-500">
                Custom flows will connect here once backend APIs plug in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="section-shell" id="services">
      <SectionHeading
        eyebrow="Platform pillars"
        title="Technology that feels personal"
        subtitle="We blended the original ConnectingHeart journey with reusable UI
        blocks so upcoming API integrations stay clean."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>

    <section className="section-shell" id="stories">
      <SectionHeading
        eyebrow="Success snapshots"
        title="Families who met through ConnectingHeart"
        subtitle="These are placeholder stories to demo the layout. Replace with live testimonials once backend endpoints are wired."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonials.map((item) => (
          <TestimonialCard key={item.couple} {...item} />
        ))}
      </div>
    </section>

    <section className="section-shell" id="how-it-works">
      <SectionHeading
        eyebrow="How it works"
        title="Same flow, refreshed experience"
        subtitle="We retained the original onboarding, curation, and connection steps so operations stay familiar."
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {steps.map((step, index) => (
          <StepCard key={step.title} step={index + 1} {...step} />
        ))}
      </div>
    </section>

    <section className="section-shell" id="pricing">
      <SectionHeading
        eyebrow="Membership plans"
        title="Transparent plans for every family"
        subtitle="Supports monetization rules shared earlier — free exploration, paid memberships, and concierge upgrades."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard key={plan.name} {...plan} />
        ))}
      </div>
    </section>

    <CTASection />
  </>
)

