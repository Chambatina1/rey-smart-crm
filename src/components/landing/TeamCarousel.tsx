'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PHOTOS = [
  '/team/raw-1.jpg', '/team/raw-2.jpg', '/team/raw-3.jpg',
  '/team/raw-4.jpg', '/team/raw-5.jpg', '/team/raw-6.jpg',
  '/team/raw-7.jpg', '/team/raw-8.jpg', '/team/raw-9.jpg',
  '/team/raw-10.jpg', '/team/raw-11.jpg', '/team/raw-12.jpg',
  '/team/raw-13.jpg', '/team/raw-14.jpg', '/team/raw-15.jpg',
  '/team/raw-16.jpg', '/team/raw-17.jpg', '/team/raw-18.jpg',
  '/team/raw-19.jpg', '/team/raw-20.jpg', '/team/raw-21.jpg',
  '/team/raw-22.jpg', '/team/raw-23.jpg',
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
    <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
      {/* Main slide */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-xl"
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
            className="relative aspect-[3/4] w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PHOTOS[current]}
              alt={`Equipo REYS ${current + 1}`}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Arrows (desktop) */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-2 text-white backdrop-blur-sm transition hover:bg-white/50 sm:p-2.5"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-2 text-white backdrop-blur-sm transition hover:bg-white/50 sm:p-2.5"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-5 w-5" />
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
