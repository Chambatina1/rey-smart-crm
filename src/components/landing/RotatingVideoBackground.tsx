'use client';

/**
 * Fondo del hero — imagen corporativa clara minimalista.
 * Look premium: texto navy sobre fondo luminoso (estilo Stripe/Apple).
 */

export function RotatingVideoBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Imagen corporativa clara */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
      />

      {/* Overlay blanco-azulado suave para uniformidad y contraste */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(248,250,252,0.65) 50%, rgba(255,255,255,0.85) 100%)',
        }}
      />
    </div>
  );
}
