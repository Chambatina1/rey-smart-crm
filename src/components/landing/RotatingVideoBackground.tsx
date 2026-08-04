'use client';

/**
 * Fondo del hero — un solo video (pool/mar) + overlay navy.
 * Sin rotación, sin múltiples videos. Máxima velocidad de carga.
 */

export function RotatingVideoBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Un solo video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/bg-pool.mp4" type="video/mp4" />
      </video>

      {/* Navy overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, oklch(0.06 0.025 264 / 0.85) 0%, oklch(0.07 0.03 264 / 0.65) 45%, oklch(0.08 0.03 264 / 0.40) 100%)',
        }}
      />
    </div>
  );
}
