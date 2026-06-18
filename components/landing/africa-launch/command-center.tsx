"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DollarSign, Globe2, Package, Users } from "lucide-react";
import { COMMAND_STATS } from "@/lib/landing/africa-hero-data";

function useAnimatedCounter(target: number, durationMs = 1400, active = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    let frame: number;

    const tick = (ts: number) => {
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, active]);

  return value;
}

type StatCardProps = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
  icon: typeof Users;
  className?: string;
};

function StatCard({ label, value, prefix = "", suffix = "", delay = 0, icon: Icon, className }: StatCardProps) {
  const reduce = useReducedMotion();
  const display = useAnimatedCounter(value, 1200, !reduce);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.45 }}
      className={`africa-hud-stat ${className ?? ""}`}
    >
      <Icon className="h-3.5 w-3.5 text-[#FF7A1A]" aria-hidden />
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/40">{label}</p>
        <p className="font-display text-lg font-bold tabular-nums text-white sm:text-xl">
          {prefix}
          {display.toLocaleString()}
          {suffix}
        </p>
      </div>
    </motion.div>
  );
}

type Props = {
  revenueBoost?: number;
};

export function AfricaCommandCenter({ revenueBoost = 0 }: Props) {
  const revenue = COMMAND_STATS.revenue + revenueBoost;

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      <StatCard
        label="Developers"
        value={COMMAND_STATS.developers}
        suffix="+"
        icon={Users}
        delay={0.1}
        className="absolute left-4 top-[22%] sm:left-8 lg:left-12"
      />
      <StatCard
        label="Products"
        value={COMMAND_STATS.products}
        suffix="+"
        icon={Package}
        delay={0.2}
        className="absolute right-4 top-[20%] sm:right-8 lg:right-12"
      />
      <StatCard
        label="Countries"
        value={COMMAND_STATS.countries}
        icon={Globe2}
        delay={0.3}
        className="absolute bottom-[28%] left-4 sm:left-8 lg:left-12"
      />
      <StatCard
        label="Revenue"
        value={revenue}
        prefix="$"
        icon={DollarSign}
        delay={0.4}
        className="absolute bottom-[26%] right-4 sm:right-8 lg:right-12"
      />
    </div>
  );
}

export function AfricaCommandCenterMobile({ revenueBoost = 0 }: Props) {
  const revenue = COMMAND_STATS.revenue + revenueBoost;
  return (
    <div className="grid grid-cols-2 gap-2">
      <StatCard label="Devs" value={COMMAND_STATS.developers} suffix="+" icon={Users} />
      <StatCard label="Products" value={COMMAND_STATS.products} suffix="+" icon={Package} />
      <StatCard label="Countries" value={COMMAND_STATS.countries} icon={Globe2} />
      <StatCard label="Revenue" value={revenue} prefix="$" icon={DollarSign} />
    </div>
  );
}
