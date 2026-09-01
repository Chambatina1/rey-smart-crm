'use client';

/**
 * Fondo del hero — imagen corporativa profesional fija + overlay navy.
 * Sin videos: carga instantánea, look premium.
 */

export function RotatingVideoBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Imagen corporativa fija */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/hero-image.jpg)' }}
      />

      {/* Overlay navy para legibilidad del texto */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, oklch(0.06 0.025 264 / 0.88) 0%, oklch(0.07 0.03 264 / 0.68) 45%, oklch(0.08 0.03 264 / 0.42) 100%)',
        }}
      />
    </div>
  );
}
