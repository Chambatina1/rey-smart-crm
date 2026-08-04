'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Carrusel del equipo.
 * Muestra las fotos EXACTAMENTE como las envió el cliente.
 * Cada foto ya tiene el nombre y cargo escritos en ella.
 * Sin texto adicional, sin avatares, sin inventar.
 */

const PHOTOS = [
  '/team/raw-1.jpg',
  '/team/raw-2.jpg',
  '/team/raw-3.jpg',
  '/team/raw-4.jpg',
  '/team/raw-5.jpg',
  '/team/raw-6.jpg',
  '/team/raw-7.jpg',
  '/team/raw-8.jpg',
  '/team/raw-9.jpg',
  '/team/raw-10.jpg',
  '/team/raw-11.jpg',
  '/team/raw-12.jpg',
  '/team/raw-13.jpg',
  '/team/raw-14.jpg',
  '/team/raw-15.jpg',
  '/team/raw-16.jpg',
  '/team/raw-17.jpg',
  '/team/raw-18.jpg',
  '/team/raw-19.jpg',
  '/team/raw-20.jpg',
  '/team/raw-21.jpg',
  '/team/raw-22.jpg',
  '/team/raw-23.jpg',
];

export function TeamCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % PHOTOS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const next = () => setCurrent((prev) => (prev + 1) % PHOTOS.length);
  const prev = () => setCurrent((prev) => (prev - 1 + PHOTOS.length) % PHOTOS.length);

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
            className="relative aspect-square"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PHOTOS[current]}
              alt={`Team member ${current + 1}`}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/50"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/50"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {PHOTOS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 bg-[var(--color-accent)]'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Photo ${i + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <p className="mt-2 text-center text-xs text-gray-400">
        {current + 1} / {PHOTOS.length}
      </p>
    </div>
  );
}
