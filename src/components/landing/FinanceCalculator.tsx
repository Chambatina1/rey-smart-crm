'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { Calculator, TrendingDown, DollarSign, Info } from 'lucide-react';

export function FinanceCalculator() {
  const { language } = useT();
  const [amount, setAmount] = useState(25000);
  const [months, setMonths] = useState(48);
  const [badRate, setBadRate] = useState(18);
  const [goodRate, setGoodRate] = useState(6);

  const t = (en: string, es: string) => (language === 'es' ? es : en);

  // Monthly payment formula: P = A * (r(1+r)^n) / ((1+r)^n - 1)
  const calc = useMemo(() => {
    const calcMonthly = (principal: number, annualRate: number, n: number) => {
      const r = annualRate / 100 / 12;
      if (r === 0) return principal / n;
      return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    };

    const badMonthly = calcMonthly(amount, badRate, months);
    const goodMonthly = calcMonthly(amount, goodRate, months);
    const badTotal = badMonthly * months;
    const goodTotal = goodMonthly * months;
    const monthlySavings = badMonthly - goodMonthly;
    const totalSavings = badTotal - goodTotal;

    return {
      badMonthly,
      goodMonthly,
      badTotal,
      goodTotal,
      monthlySavings,
      totalSavings,
    };
  }, [amount, months, badRate, goodRate]);

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString();

  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div className="pointer-events-none absolute -right-40 top-10 h-72 w-72 rounded-full bg-[var(--color-gold)]/8 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            <Calculator className="h-3.5 w-3.5" />
            {t('CREDIT SCORE CALCULATOR', 'CALCULADORA DE PUNTAJE DE CRÉDITO')}
          </span>
          <h2 className="mt-5 text-3xl font-bold text-gray-900 sm:text-4xl">
            {t('See how your credit score affects interest rates', 'Mira cómo tu puntaje de crédito afecta las tasas de interés')}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t(
              'A higher credit score typically qualifies you for lower interest rates on loans and credit. This calculator illustrates how improving your score could reduce what you pay.',
              'Un puntaje de crédito más alto típicamente te califica para tasas de interés más bajas en préstamos y crédito. Esta calculadora ilustra cómo mejorar tu puntaje podría reducir lo que pagas.'
            )}
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Inputs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8"
          >
            <h3 className="mb-6 text-lg font-bold text-gray-900">{t('Loan details', 'Detalles del préstamo')}</h3>

            {/* Loan amount */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('Loan amount', 'Monto del préstamo')}: <span className="font-bold text-[var(--color-primary)]">{fmt(amount)}</span>
              </label>
              <input
                type="range"
                min="5000"
                max="100000"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>$5K</span>
                <span>$100K</span>
              </div>
            </div>

            {/* Term */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('Term', 'Plazo')}: <span className="font-bold text-[var(--color-primary)]">{months} {t('months', 'meses')}</span>
              </label>
              <input
                type="range"
                min="12"
                max="72"
                step="6"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>1 {t('yr', 'año')}</span>
                <span>6 {t('yrs', 'años')}</span>
              </div>
            </div>

            {/* Rates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-red-600">
                  {t('Bad credit rate', 'Tasa crédito malo')}
                </label>
                <div className="flex items-center rounded-lg border border-red-200 bg-white px-3 py-2">
                  <input
                    type="number"
                    value={badRate}
                    onChange={(e) => setBadRate(Number(e.target.value))}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                  <span className="text-sm text-red-500">% APR</span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-accent)]">
                  {t('Good credit rate', 'Tasa crédito bueno')}
                </label>
                <div className="flex items-center rounded-lg border border-green-200 bg-white px-3 py-2">
                  <input
                    type="number"
                    value={goodRate}
                    onChange={(e) => setGoodRate(Number(e.target.value))}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                  <span className="text-sm text-[var(--color-accent)]">% APR</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border-2 border-[var(--color-accent)]/20 bg-gradient-to-br from-[var(--color-accent)]/5 to-[var(--color-gold)]/5 p-6 sm:p-8"
          >
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
              <TrendingDown className="h-5 w-5 text-[var(--color-accent)]" />
              {t('Your potential savings', 'Tu ahorro potencial')}
            </h3>

            {/* Monthly payment comparison */}
            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-3">
                <span className="text-sm text-gray-600">{t('With bad credit', 'Con crédito malo')}</span>
                <span className="text-lg font-bold text-red-600">{fmt(calc.badMonthly)}/mo</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-3">
                <span className="text-sm text-gray-600">{t('With good credit', 'Con crédito bueno')}</span>
                <span className="text-lg font-bold text-[var(--color-accent)]">{fmt(calc.goodMonthly)}/mo</span>
              </div>
            </div>

            {/* Savings highlight */}
            <div className="rounded-xl bg-[var(--color-accent)] p-5 text-white">
              <p className="text-sm opacity-90">{t('You save', 'Ahorras')}</p>
              <p className="my-1 text-4xl font-bold">{fmt(calc.monthlySavings)}<span className="text-lg">/mo</span></p>
              <p className="text-sm opacity-90">
                {t('Total savings', 'Ahorro total')}: <span className="font-bold">{fmt(calc.totalSavings)}</span>
              </p>
            </div>

            {/* Disclaimer — visible and prominent */}
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="flex items-start gap-2 text-sm font-medium text-amber-800">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {t(
                  'This is an estimated example only. Actual interest rates depend on the lender, your full credit profile, income, and other factors. REYS Smart Solutions does not guarantee specific rates or outcomes.',
                  'Este es solo un ejemplo estimado. Las tasas de interés reales dependen del prestamista, tu perfil crediticio completo, ingresos y otros factores. REYS Smart Solutions no garantiza tasas o resultados específicos.'
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
