'use client';

import { motion } from 'framer-motion';

/**
 * Sección del equipo — imagen mosaico oficial.
 * (Próximamente: video institucional consolidado de YouTube)
 */

export function TeamCarousel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative mx-auto w-full max-w-3xl"
    >
      <div className="overflow-hidden rounded-2xl shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/team-mosaic.jpg"
          alt="Equipo REYS Smart Solutions"
          className="block w-full h-auto"
          loading="lazy"
        />
      </div>
    </motion.div>
  );
}
