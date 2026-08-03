'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TEAM = [
  { name: 'Reys Michel', role: 'Presidente y Cofundador', roleEn: 'President & Co-Founder', photo: '/team/reys-michel.jpg', featured: true },
  { name: 'Yolanda Perón', role: 'Vicepresidenta y Cofundadora', roleEn: 'Vice President & Co-Founder', photo: '/team/yolanda-peron.jpg', featured: true },
  { name: 'Nelson Mejivar', role: 'Subdirector General', roleEn: 'General Sub-Director', photo: '/team/nelson-mejivar.jpg' },
  { name: 'Vladimir Cáceres', role: 'Subdirector Comercial', roleEn: 'Commercial Sub-Director', photo: '/team/vladimir-caceres.jpg' },
  { name: 'Diego Quijada', role: 'Subdirector de Ventas', roleEn: 'Sales Sub-Director', photo: '/team/diego-quijada.jpg' },
  { name: 'Judit Mejivar', role: 'Subdirectora de Procesos', roleEn: 'Process Sub-Director', photo: '/team/judit-mejivar.jpg' },
  { name: 'Maikel', role: 'El Arquitecto de las Finanzas', roleEn: 'The Finance Architect', photo: '/team/maikel.jpg' },
  { name: 'Carolina Domínguez', role: 'Subdirectora de Capacitaciones y RRHH', roleEn: 'Training & HR Sub-Director', photo: '/team/carolina-dominguez.jpg' },
  { name: 'Jacob Mejivar', role: 'Depto. de Agencias de Crédito', roleEn: 'Credit Agencies Dept.', photo: null },
  { name: 'Christopher Aaron', role: 'Depto. de Acreedores', roleEn: 'Creditors Dept.', photo: null },
  { name: 'Fátima Santos', role: 'Depto. de Procesos', roleEn: 'Process Dept.', photo: null },
  { name: 'Abigail Gochez', role: 'Depto. de Procesos', roleEn: 'Process Dept.', photo: '/team/abigail-gochez.jpg' },
  { name: 'Doris Bonilla', role: 'Depto. de Redes Sociales y Eventos', roleEn: 'Social Media & Events Dept.', photo: null },
  { name: 'Eduardo Perón', role: 'Relaciones Comunitarias y Enlace Bilingüe', roleEn: 'Community Relations & Bilingual Liaison', photo: '/team/eduardo-peron.jpg' },
];

export function TeamCarousel() {
  const { language } = useT();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TEAM.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const next = () => setCurrent((prev) => (prev + 1) % TEAM.length);
  const prev = () => setCurrent((prev) => (prev - 1 + TEAM.length) % TEAM.length);

  const member = TEAM[current];
  const memberRole = language === 'es' ? member.role : member.roleEn;

  return (
    <div
      className="relative mx-auto max-w-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main slide */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative aspect-[4/5] sm:aspect-[3/2]"
          >
            {/* Photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={member.photo}
              alt={member.name}
              className="h-full w-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

            {/* Featured badge */}
            {member.featured && (
              <div className="absolute right-4 top-4 rounded-full bg-[var(--color-gold)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--color-primary)] shadow-lg">
                ⭐ {language === 'es' ? 'Cofundador' : 'Co-Founder'}
              </div>
            )}

            {/* Name + role overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <h3 className="text-2xl font-bold text-white drop-shadow-lg sm:text-3xl">
                {member.name}
              </h3>
              <p className="mt-1 text-base font-medium text-[var(--color-gold)] drop-shadow-lg sm:text-lg">
                {memberRole}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/40"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/40"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {TEAM.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 bg-[var(--color-accent)]'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Member ${i + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <p className="mt-2 text-center text-xs text-gray-400">
        {current + 1} / {TEAM.length}
      </p>
    </div>
  );
}
