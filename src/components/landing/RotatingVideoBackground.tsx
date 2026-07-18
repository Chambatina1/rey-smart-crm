'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Fondo de video rotativo que cambia entre 5 escenas aspiracionales:
 * - Piscina (ocio/frescura)
 * - Mansión (casa propia/patrimonio)
 * - Carro de lujo (vehículo)
 * - Avión (viajes/oportunidades)
 * - Vacaciones (tranquilidad/familia)
 *
 * Cambia cada 8 segundos con un fade suave.
 * Cada video tiene un overlay navy para legibilidad del texto.
 */

const VIDEOS = [
  { src: '/bg-pool.mp4', label: 'Relax' },
  { src: '/bg-mansion.mp4', label: 'Home' },
  { src: '/bg-car.mp4', label: 'Drive' },
  { src: '/bg-airplane.mp4', label: 'Travel' },
  { src: '/bg-vacation.mp4', label: 'Vacation' },
];

const ROTATION_MS = 8000; // 8 segundos por video

export function RotatingVideoBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Rotation cycle
    const interval = setInterval(() => {
      setIsTransitioning(true);

      // After fade out, switch to next video
      const switchTimer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % VIDEOS.length);
        setNextIndex((prev) => (prev + 1) % VIDEOS.length);
        setIsTransitioning(false);
      }, 1000); // 1s fade

      timersRef.current.push(switchTimer);
    }, ROTATION_MS);

    return () => {
      clearInterval(interval);
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Current video */}
      <video
        key={`current-${currentIndex}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
        style={{ opacity: isTransitioning ? 0 : 1 }}
      >
        <source src={VIDEOS[currentIndex].src} type="video/mp4" />
      </video>

      {/* Next video (preloaded, fades in during transition) */}
      <video
        key={`next-${nextIndex}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
        style={{ opacity: isTransitioning ? 1 : 0 }}
      >
        <source src={VIDEOS[nextIndex].src} type="video/mp4" />
      </video>

      {/* Navy overlay — directional for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, oklch(0.06 0.025 264 / 0.85) 0%, oklch(0.07 0.03 264 / 0.65) 45%, oklch(0.08 0.03 264 / 0.40) 100%)',
        }}
      />

      {/* Scene indicator dots (bottom center) */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentIndex(i);
                setNextIndex((i + 1) % VIDEOS.length);
                setIsTransitioning(false);
              }, 500);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-8 bg-[var(--color-gold)]'
                : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Scene ${i + 1}`}
          />
        ))}
      </div>

      {/* Scene label (top right, subtle) */}
      <div
        className="absolute right-6 top-20 z-10 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-sm transition-opacity duration-500"
        style={{ opacity: isTransitioning ? 0 : 1 }}
      >
        {VIDEOS[currentIndex].label}
      </div>
    </div>
  );
}
