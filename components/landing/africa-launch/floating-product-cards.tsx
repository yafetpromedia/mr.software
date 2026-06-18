"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { HERO_PRODUCTS } from "@/lib/landing/africa-hero-data";

const POSITIONS = [
  "left-[4%] top-[20%]",
  "right-[2%] top-[38%]",
  "right-[8%] bottom-[18%]",
] as const;

type Props = {
  visibleCount: number;
};

export function FloatingProductCards({ visibleCount }: Props) {
  const reduce = useReducedMotion();
  const products = HERO_PRODUCTS.slice(0, Math.min(visibleCount, HERO_PRODUCTS.length));

  return (
    <div className="pointer-events-none absolute inset-0 z-30 hidden md:block" aria-hidden>
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={reduce ? false : { opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
          transition={{
            opacity: { delay: i * 0.3, duration: 0.45 },
            scale: { delay: i * 0.3, duration: 0.45 },
            y: { delay: 1.2 + i * 0.5, duration: 3.5 + i, repeat: Infinity, ease: "easeInOut" },
          }}
          className={`africa-product-card absolute ${POSITIONS[i % POSITIONS.length]} w-[11.5rem]`}
        >
          <p className="font-display text-sm font-bold text-white">{product.name}</p>
          <ul className="mt-2 space-y-1 text-[11px] text-white/60">
            <li className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-[#FF7A1A]" aria-hidden />
              {product.countries} Countries
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-[#FF7A1A]" aria-hidden />
              {product.metric} {product.metricLabel}
            </li>
          </ul>
          <span className="mt-2 inline-flex rounded-full border border-[#FF7A1A]/25 bg-[#FF7A1A]/10 px-2 py-0.5 text-[10px] font-medium text-orange-200">
            {product.status}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
