'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

/**
 * Sección "Cómo Funciona" — El Puente Interactivo
 * El crédito como puente entre la situación actual y la nueva vida.
 */

export function BridgeHowItWorks() {
  const { language } = useT();
  const [step, setStep] = useState(1);

  const steps = language === 'es' ? [
    {
      num: '01',
      title: 'Construimos los cimientos',
      headline: 'Conocemos tu situación',
      bullets: ['Analizamos tu reporte de crédito.', 'Identificamos qué está afectando tu puntaje.', 'Te explicamos exactamente qué está pasando.', 'Creamos un plan personalizado para mejorar tu crédito.'],
      message: 'Todo gran puente comienza con unos buenos cimientos.',
    },
    {
      num: '02',
      title: 'Construimos el puente',
      headline: 'Trabajamos en tu crédito',
      bullets: ['Disputamos errores.', 'Optimizamos tu perfil.', 'Creamos estrategias para aumentar tu puntaje.', 'Te acompañamos durante todo el proceso.'],
      message: 'Ahora estamos construyendo el camino hacia tus metas.',
    },
    {
      num: '03',
      title: 'El puente está terminado',
      headline: 'Cruza hacia nuevas oportunidades',
      bullets: ['Financiamiento', 'Compra de vivienda', 'Vehículos', 'Mejores tasas de interés', 'Más tranquilidad financiera'],
      message: 'Tu crédito ya no es un obstáculo. Ahora tienes un puente hacia nuevas oportunidades.',
    },
  ] : [
    {
      num: '01',
      title: 'Building the foundations',
      headline: 'We understand your situation',
      bullets: ['We analyze your credit report.', 'We identify what is hurting your score.', 'We explain exactly what is happening.', 'We create a personalized plan to improve your credit.'],
      message: 'Every great bridge starts with solid foundations.',
    },
    {
      num: '02',
      title: 'Building the bridge',
      headline: 'We work on your credit',
      bullets: ['We dispute errors.', 'We optimize your profile.', 'We create strategies to raise your score.', 'We support you throughout the entire process.'],
      message: 'Now we are building the path to your goals.',
    },
    {
      num: '03',
      title: 'The bridge is complete',
      headline: 'Cross toward new opportunities',
      bullets: ['Financing', 'Home purchase', 'Vehicles', 'Better interest rates', 'More financial peace of mind'],
      message: 'Your credit is no longer an obstacle. Now you have a bridge to new opportunities.',
    },
  ];

  const current = steps[step - 1];

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 40%, oklch(0.96 0.01 220) 0%, transparent 70%)',
      }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="inline-block rounded-full bg-[var(--color-gold)]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
            {language === 'es' ? 'EL PROCESO' : 'THE PROCESS'}
          </span>
          <h2 className="mt-5 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            {language === 'es' ? 'Construimos tu puente hacia el futuro' : 'We build your bridge to the future'}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            {language === 'es'
              ? 'Tu crédito no es solo un número. Es el puente que conecta donde estás con la vida que quieres alcanzar.'
              : 'Your credit is not just a number. It is the bridge connecting where you are to the life you want.'}
          </p>
        </motion.div>

        {/* Interactive bridge visualization */}
        <div className="mb-12">
          <BridgeScene step={step} language={language} />
        </div>

        {/* Step selector buttons */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {steps.map((s, i) => {
            const num = i + 1;
            const isActive = step === num;
            return (
              <button
                key={num}
                onClick={() => setStep(num)}
                className={`group flex items-center gap-3 rounded-2xl border-2 px-5 py-3 transition-all duration-300 ${
                  isActive
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isActive ? 'bg-[var(--color-accent)] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {s.num}
                </span>
                <span className={`text-sm font-semibold transition-colors ${
                  isActive ? 'text-[var(--color-accent)]' : 'text-gray-600'
                }`}>
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mx-auto max-w-3xl"
          >
            <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-8 shadow-xl sm:p-10">
              <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">{current.headline}</h3>
              <ul className="mt-6 space-y-3">
                {current.bullets.map((b, j) => (
                  <motion.li
                    key={j}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + j * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/15">
                      <Check className="h-3 w-3 text-[var(--color-accent)]" />
                    </span>
                    <span className="text-gray-700">{b}</span>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-6 border-l-4 border-[var(--color-gold)] bg-[var(--color-gold)]/5 py-3 pl-4 pr-3">
                <p className="font-medium italic text-gray-800">"{current.message}"</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <Button
              onClick={scrollToContact}
              size="lg"
              className="bg-[var(--color-gold)] px-8 py-6 text-base font-semibold text-[var(--color-primary)] shadow-xl shadow-[var(--color-gold)]/25 hover:brightness-110"
            >
              {language === 'es' ? 'Comienza a construir tu puente' : 'Start building your bridge'}
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ── Bridge SVG scene ───────────────────────────────────── */
function BridgeScene({ step, language }: { step: number; language: string }) {
  return (
    <div className="relative mx-auto aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-2xl shadow-inner">
      {/* Sky — changes color based on step */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: step === 1
            ? 'linear-gradient(to bottom, #cbd5e1 0%, #94a3b8 100%)'
            : step === 2
            ? 'linear-gradient(to bottom, #bae6fd 0%, #93c5fd 100%)'
            : 'linear-gradient(to bottom, #fef9c3 0%, #fde68a 30%, #bae6fd 100%)',
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Sun (step 3) */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 70, height: 70,
          background: 'radial-gradient(circle, #fde047 0%, #fbbf24 60%, transparent 100%)',
          filter: 'blur(2px)', right: '18%', top: '12%',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: step === 3 ? 1 : 0, opacity: step === 3 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Left shore (dark, current situation) */}
      <div className="absolute bottom-0 left-0 h-[55%] w-[26%]">
        <svg viewBox="0 0 200 200" className="h-full w-full" preserveAspectRatio="none">
          <path d="M0,200 L0,120 Q40,100 80,110 Q120,90 160,105 Q180,110 200,100 L200,200 Z" fill="#475569" />
          <path d="M0,200 L0,140 Q50,125 100,130 Q150,120 200,125 L200,200 Z" fill="#334155" />
          {/* Bare tree */}
          <rect x="60" y="55" width="4" height="40" fill="#1e293b" />
          <path d="M62,55 L45,35 M62,50 L80,30 M62,45 L52,25 M62,42 L75,22" stroke="#1e293b" strokeWidth="2" fill="none" />
        </svg>
        <div className="absolute bottom-3 left-3 rounded-lg bg-slate-900/70 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
          {language === 'es' ? '⚠ Situación actual' : '⚠ Current situation'}
        </div>
      </div>

      {/* Right shore (bright, new life) */}
      <div className="absolute bottom-0 right-0 h-[55%] w-[26%]">
        <svg viewBox="0 0 200 200" className="h-full w-full" preserveAspectRatio="none">
          <path d="M0,200 L0,120 Q40,100 80,110 Q120,90 160,105 Q180,110 200,100 L200,200 Z" fill="#86efac" />
          <path d="M0,200 L0,140 Q50,125 100,130 Q150,120 200,125 L200,200 Z" fill="#4ade80" />
        </svg>
        {/* House */}
        <motion.div
          className="absolute"
          style={{ right: '18%', bottom: '38%' }}
          initial={{ opacity: 0.3, scale: 0.7 }}
          animate={{ opacity: step === 3 ? 1 : step === 2 ? 0.6 : 0.3, scale: step === 3 ? 1 : 0.8 }}
          transition={{ duration: 0.6 }}
        >
          <svg width="55" height="45" viewBox="0 0 55 45">
            <path d="M27,3 L3,20 L52,20 Z" fill="#f59e0b" />
            <rect x="6" y="20" width="43" height="24" fill="#fef3c7" />
            <rect x="22" y="30" width="10" height="14" fill="#92400e" />
            <rect x="11" y="26" width="7" height="7" fill="#60a5fa" />
            <rect x="37" y="26" width="7" height="7" fill="#60a5fa" />
          </svg>
        </motion.div>
        <div className="absolute bottom-3 right-3 rounded-lg bg-emerald-600/80 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
          {language === 'es' ? '✓ Tu nueva vida' : '✓ Your new life'}
        </div>
      </div>

      {/* River */}
      <motion.div
        className="absolute bottom-0 left-[24%] right-[24%] h-[38%]"
        animate={{ background: step === 1 ? 'linear-gradient(to bottom, #64748b, #475569)' : 'linear-gradient(to bottom, #38bdf8, #0ea5e9)' }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 12px)',
        }} />
      </motion.div>

      {/* THE BRIDGE */}
      <svg className="absolute bottom-[18%] left-[18%] h-[42%] w-[64%]" viewBox="0 0 600 200" preserveAspectRatio="none">
        {/* Pillars (step 1+) */}
        <motion.rect x="80" y="100" width="20" height="100" fill="#94a3b8"
          initial={{ height: 0 }} animate={{ height: step >= 1 ? 100 : 0 }} transition={{ duration: 0.6 }} />
        <motion.rect x="280" y="80" width="20" height="120" fill="#94a3b8"
          initial={{ height: 0 }} animate={{ height: step >= 1 ? 120 : 0 }} transition={{ duration: 0.6, delay: 0.15 }} />
        <motion.rect x="480" y="100" width="20" height="100" fill="#94a3b8"
          initial={{ height: 0 }} animate={{ height: step >= 1 ? 100 : 0 }} transition={{ duration: 0.6, delay: 0.3 }} />

        {/* Deck + cables (step 2+) */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: step >= 2 ? 1 : 0 }} transition={{ duration: 0.5, delay: step >= 2 ? 0.3 : 0 }}>
          <path d="M0,90 Q90,75 90,90 Q180,65 290,70 Q400,75 500,90 Q550,85 600,90 L600,100 L0,100 Z" fill={step >= 3 ? '#fbbf24' : '#cbd5e1'} />
          {/* Cables */}
          <line x1="90" y1="90" x2="90" y2="40" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="150" y1="82" x2="150" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="210" y1="75" x2="210" y2="25" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="290" y1="70" x2="290" y2="20" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="370" y1="75" x2="370" y2="25" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="450" y1="82" x2="450" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="510" y1="90" x2="510" y2="40" stroke="#94a3b8" strokeWidth="1.5" />
          {/* Main suspension */}
          <path d="M0,90 Q300,10 600,90" fill="none" stroke={step >= 3 ? '#f59e0b' : '#94a3b8'} strokeWidth="3" />
        </motion.g>

        {/* Person walking (step 3) */}
        <motion.g
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: step >= 3 ? 1 : 0, x: step >= 3 ? 400 : 0 }}
          transition={{ opacity: { duration: 0.3 }, x: { duration: 2.5, repeat: step >= 3 ? Infinity : 0, repeatType: 'reverse', repeatDelay: 1 } }}
        >
          <circle cx="10" cy="78" r="5" fill="#1e293b" />
          <rect x="7" y="83" width="6" height="12" rx="2" fill="#1e293b" />
          <rect x="7" y="95" width="2.5" height="8" fill="#1e293b" />
          <rect x="10.5" y="95" width="2.5" height="8" fill="#1e293b" />
        </motion.g>
      </svg>

      {/* Step indicator */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-gray-700 shadow-md backdrop-blur-sm">
        {language === 'es' ? 'Paso' : 'Step'} {step} / 3
      </div>
    </div>
  );
}
