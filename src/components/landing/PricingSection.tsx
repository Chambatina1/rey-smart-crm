'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Star, Loader2, ShieldCheck } from 'lucide-react';

interface Plan {
  id: string;
  code: string;
  name: string;
  nameEs?: string;
  description?: string;
  descriptionEs?: string;
  priceSetup: number;
  priceMonthly: number;
  currency: string;
  features: string[];
  featuresEs?: string[];
  isFeatured: boolean;
}

export function PricingSection() {
  const { t, language } = useT();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/plans')
      .then((r) => r.json())
      .then((data) => {
        setPlans(data.plans || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="relative overflow-hidden bg-gray-50 py-20">
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[var(--color-accent)]/6 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-[var(--color-gold)]/6 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-gold)]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
            <Star className="h-3.5 w-3.5" />
            {t.landing.pricingEyebrow}
          </span>
          <h2 className="mt-5 text-3xl font-bold text-gray-900 sm:text-4xl">
            {t.landing.pricingTitle}
          </h2>
          <p className="mt-4 text-lg text-gray-600">{t.landing.pricingSubtitle}</p>

          {/* No upfront badge */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)]/10 px-5 py-2.5 ring-1 ring-[var(--color-accent)]/20">
            <ShieldCheck className="h-5 w-5 text-[var(--color-accent)]" />
            <span className="font-semibold text-[var(--color-accent)]">{t.landing.pricingNoUpfront}</span>
          </div>
        </motion.div>

        {/* Plans grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const name = language === 'es' ? (plan.nameEs || plan.name) : plan.name;
            const desc = language === 'es' ? (plan.descriptionEs || plan.description || '') : (plan.description || '');
            const features = language === 'es' ? (plan.featuresEs || plan.features) : plan.features;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className={`relative rounded-2xl border-2 bg-white p-8 shadow-lg transition-all hover:shadow-2xl ${
                  plan.isFeatured
                    ? 'border-[var(--color-gold)] ring-4 ring-[var(--color-gold)]/10 lg:-mt-4 lg:mb-4'
                    : 'border-gray-200'
                }`}
              >
                {/* Featured badge */}
                {plan.isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-[var(--color-gold)] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-primary)] shadow-md">
                      ⭐ {t.landing.pricingMostPopular}
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
                <p className="mt-1 text-sm text-gray-500">{desc}</p>

                {/* Price */}
                <div className="mt-6">
                  <div className="flex items-end gap-1">
                    {plan.priceSetup > 0 ? (
                      <>
                        <span className="text-4xl font-bold text-gray-900">${plan.priceSetup}</span>
                        <span className="mb-1.5 text-sm text-gray-500">{language === 'es' ? 'inicio' : 'setup'}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-[var(--color-accent)]">$0</span>
                        <span className="mb-1.5 text-sm font-semibold text-[var(--color-accent)]">{language === 'es' ? 'inicio' : 'start'}</span>
                      </>
                    )}
                  </div>
                  {plan.priceMonthly > 0 && (
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">${plan.priceMonthly}{t.landing.pricingMonth}</span>{' '}
                      <span className="text-xs text-gray-400">{t.landing.pricingAfterResult}</span>
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  {features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent)]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={scrollToContact}
                  className={`mt-8 w-full py-5 text-base font-semibold transition ${
                    plan.isFeatured
                      ? 'bg-[var(--color-gold)] text-[var(--color-primary)] shadow-lg shadow-[var(--color-gold)]/25 hover:brightness-110'
                      : 'bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/25 hover:brightness-110'
                  }`}
                >
                  {plan.priceSetup === 0 ? t.landing.pricingStartFree : t.landing.pricingGetStarted}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Reassurance below */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center text-sm text-gray-500"
        >
          {language === 'es'
            ? 'Todos los planes incluyen evaluación gratuita · Sin contratos forzados · Cancela cuando quieras'
            : 'All plans include free evaluation · No forced contracts · Cancel anytime'}
        </motion.p>
      </div>
    </section>
  );
}
