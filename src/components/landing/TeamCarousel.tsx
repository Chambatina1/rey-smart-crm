'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PHOTOS = [
  '/team/member-1.webp', '/team/member-2.webp', '/team/member-3.webp',
  '/team/member-4.webp', '/team/member-5.webp', '/team/member-6.webp',
  '/team/member-7.webp', '/team/member-9.webp',
  '/team/member-10.webp', '/team/member-11.webp', '/team/member-12.webp',
  '/team/member-13.webp', '/team/member-14.webp', '/team/member-15.webp',
  '/team/member-16.webp', '/team/member-17.webp', '/team/member-18.webp',
  '/team/member-19.webp', '/team/member-20.webp', '/team/member-21.webp',
  '/team/member-22.webp', '/team/member-23.webp',
];

export function TeamCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % PHOTOS.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + PHOTOS.length) % PHOTOS.length);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(next, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next]);

  // Touch / swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        next(); // swipe left → next
      } else {
        prev(); // swipe right → prev
      }
    }
    setTimeout(() => setIsPaused(false), 3000);
  };

  return (
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-sm">
      {/* Main slide */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-xl bg-gray-100"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ touchAction: 'pan-y' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PHOTOS[current]}
              alt={`Equipo REYS ${current + 1}`}
              className="block w-full h-auto object-contain"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Arrows */}
        <button
          onClick={prev}
          className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/50 sm:left-2 sm:p-2"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/50 sm:right-2 sm:p-2"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="mt-3 flex flex-wrap justify-center gap-1">
        {PHOTOS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-5 bg-[var(--color-accent)]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Foto ${i + 1}`}
          />
        ))}
      </div>

      {/* Counter + swipe hint */}
      <p className="mt-2 text-center text-xs text-gray-400">
        {current + 1} / {PHOTOS.length} · <span className="hidden sm:inline">← →</span><span className="sm:hidden">👆 desliza</span>
      </p>
    </div>
  );
}
