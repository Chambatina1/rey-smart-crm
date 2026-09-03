'use client';

import { motion } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import TeamSection from '@/components/landing/TeamSection';

export function AboutSection() {
  const { language } = useT();
  const es = language === 'es';

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const blocks = [
    {
      title: es ? '3 frentes simultáneos' : '3 simultaneous fronts',
      desc: es ? 'Protección, construcción y educación.' : 'Protection, building, and education.',
    },
    {
      title: es ? 'Métodos comprobados' : 'Proven methods',
      desc: es ? 'Trabajamos conforme a la normativa vigente.' : 'We work in compliance with current regulations.',
    },
    {
      title: es ? 'Acompañamiento real' : 'Real guidance',
      desc: es ? 'Estamos presentes en cada paso del proceso.' : 'We are present at every step of the process.',
    },
    {
      title: es ? 'Evaluación personalizada' : 'Personalized evaluation',
      desc: es
        ? 'El precio depende de las necesidades y de la evaluación individual de cada cliente.'
        : 'Pricing depends on each client\u2019s needs and individual evaluation.',
    },
  ];

  return (
    <section id="about" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]">
            {es ? 'QUIÉNES SOMOS' : 'WHO WE ARE'}
          </span>

          <h2 className="mt-5 text-3xl font-bold leading-tight text-[var(--color-primary)] sm:text-4xl">
            {es ? (
              <>
                Un equipo de expertos que ayuda a personas, familias y empresarios a{' '}
                <span className="text-[var(--color-accent)]">transformar su crédito</span> y{' '}
                <span className="text-[var(--color-accent)]">construir el futuro</span> que merecen.
              </>
            ) : (
              <>
                A team of experts helping people, families, and business owners{' '}
                <span className="text-[var(--color-accent)]">transform their credit</span> and{' '}
                <span className="text-[var(--color-accent)]">build the future</span> they deserve.
              </>
            )}
          </h2>

          <p className="mt-6 text-lg leading-relaxed text-gray-600">
            {es
              ? 'Acompañamos a personas, familias y empresarios hispanos en Estados Unidos a entender su situación crediticia y tomar mejores decisiones financieras.'
              : 'We accompany Hispanic individuals, families, and business owners in the United States to understand their credit situation and make better financial decisions.'}
          </p>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            {es
              ? 'Analizamos su perfil, armamos un plan realista con usted y lo acompañamos mientras lo ejecuta.'
              : 'We analyze your profile, build a realistic plan with you, and support you while you execute it.'}
          </p>
          <p className="mt-4 text-lg font-semibold text-[var(--color-primary)]">
            {es ? 'No vendemos promesas ni atajos.' : 'We don\u2019t sell promises or shortcuts.'}
          </p>
        </motion.div>

        {/* 4 bloques diferenciadores */}
        <div className="mx-auto mt-14 grid max-w-4xl gap-5 sm:grid-cols-2">
          {blocks.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)]/40 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-[var(--color-accent)]" />
                <div>
                  <h3 className="font-bold text-[var(--color-primary)]">{b.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-gray-600">{b.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-14 max-w-2xl text-center"
        >
          <p className="text-2xl font-bold leading-snug text-[var(--color-primary)] sm:text-3xl">
            {es
              ? 'Tu situación financiera es única. Tu estrategia también debería serlo.'
              : 'Your financial situation is unique. Your strategy should be too.'}
          </p>
          <Button
            onClick={scrollToContact}
            className="mt-7 bg-[var(--color-accent)] px-10 py-6 text-base font-bold text-white shadow-lg shadow-[var(--color-accent)]/25 transition hover:brightness-110"
          >
            {es ? 'SOLICITA TU EVALUACIÓN' : 'REQUEST YOUR EVALUATION'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      {/* Mosaico del equipo — debajo del texto */}
      <div className="mt-16">
        <TeamSection />
      </div>
    </section>
  );
}
