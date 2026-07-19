'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Fondo rotativo del hero — mezcla videos y fotos del equipo.
 * Cambia cada 7 segundos con un fade suave.
 * Las fotos usan efecto Ken Burns (zoom lento) para verse vivas.
 */

type Scene = {
  src: string;
  label: string;
  type: 'video' | 'image';
  // Ken Burns direction (solo imágenes): 'zoom-in' | 'zoom-out' | 'pan-right'
  kenBurns?: string;
};

const SCENES: Scene[] = [
  { src: '/bg-pool.mp4', label: 'Relax', type: 'video' },
  { src: '/bg-mansion.mp4', label: 'Home', type: 'video' },
  { src: '/bg-team1.jpg', label: 'REYS Team', type: 'image', kenBurns: 'zoom-in' },
  { src: '/bg-car.mp4', label: 'Drive', type: 'video' },
  { src: '/bg-team2.jpg', label: 'REYS Team', type: 'image', kenBurns: 'pan-right' },
  { src: '/bg-airplane.mp4', label: 'Travel', type: 'video' },
  { src: '/bg-vacation.mp4', label: 'Vacation', type: 'video' },
];

const ROTATION_MS = 7000; // 7 segundos por escena

export function RotatingVideoBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);

      const switchTimer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % SCENES.length);
        setIsTransitioning(false);
      }, 1000);

      return () => clearTimeout(switchTimer);
    }, ROTATION_MS);

    return () => clearInterval(interval);
  }, []);

  const goToScene = (i: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(i);
      setIsTransitioning(false);
    }, 500);
  };

  const current = SCENES[currentIndex];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Current scene */}
      {current.type === 'video' ? (
        <video
          key={`scene-${currentIndex}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
          style={{ opacity: isTransitioning ? 0 : 1 }}
        >
          <source src={current.src} type="video/mp4" />
        </video>
      ) : (
        /* Image with Ken Burns effect */
        <div
          key={`scene-${currentIndex}`}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: isTransitioning ? 0 : 1,
            backgroundImage: `url(${current.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            animation: `${current.kenBurns === 'pan-right' ? 'kenburns-pan' : 'kenburns-zoom'} 7s ease-out forwards`,
          }}
        />
      )}

      {/* Preload next scene (hidden) */}
      {(() => {
        const nextIdx = (currentIndex + 1) % SCENES.length;
        const next = SCENES[nextIdx];
        if (next.type === 'video') {
          return (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
              style={{ opacity: 0 }}
            >
              <source src={next.src} type="video/mp4" />
            </video>
          );
        }
        return null;
      })()}

      {/* Navy overlay — directional for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, oklch(0.06 0.025 264 / 0.85) 0%, oklch(0.07 0.03 264 / 0.65) 45%, oklch(0.08 0.03 264 / 0.40) 100%)',
        }}
      />

      {/* Scene indicator dots */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SCENES.map((_, i) => (
          <button
            key={i}
            onClick={() => goToScene(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-8 bg-[var(--color-gold)]'
                : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Scene ${i + 1}`}
          />
        ))}
      </div>

      {/* Scene label */}
      <div
        className="absolute right-6 top-20 z-10 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-sm transition-opacity duration-500"
        style={{ opacity: isTransitioning ? 0 : 1 }}
      >
        {current.label}
      </div>

      {/* Ken Burns keyframes (injectados) */}
      <style>{`
        @keyframes kenburns-zoom {
          0% { transform: scale(1.0); }
          100% { transform: scale(1.15); }
        }
        @keyframes kenburns-pan {
          0% { transform: scale(1.1) translateX(0%); }
          100% { transform: scale(1.1) translateX(-3%); }
        }
      `}</style>
    </div>
  );
}
