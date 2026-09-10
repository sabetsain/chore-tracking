import React, { useMemo } from 'react';
import clsx from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';

export type IdentityStickerVariant = 'slate' | 'sage' | 'teal' | 'stone' | 'charcoal';

export interface IdentityStickerProps extends Omit<HTMLMotionProps<'span'>, 'children'> {
  glyph?: string;
  name?: string;
  showLabel?: boolean;
  rotation?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: IdentityStickerVariant;
  className?: string;
  title?: string;
}

const VARIANT_CLASSES: Record<IdentityStickerVariant, string> = {
  slate: 'bg-[#EAEFF5] text-[#28415C] border-[#CBD5E1] dark:bg-[#1E293B] dark:text-[#94A3B8] dark:border-[#334155]',
  sage: 'bg-[#EEF4F0] text-[#3E6B52] border-[#C2D6C9] dark:bg-[#1A2E23] dark:text-[#A7D1B9] dark:border-[#2E4D3B]',
  teal: 'bg-[#EDF7F7] text-[#2C6E6D] border-[#C3DFDE] dark:bg-[#162C2C] dark:text-[#80CBC4] dark:border-[#274E4D]',
  stone: 'bg-[#F4EFEA] text-[#57534E] border-[#E3DDD5] dark:bg-[#262422] dark:text-[#D6D3D1] dark:border-[#44403C]',
  charcoal: 'bg-[#ECECED] text-[#1E232B] border-[#D1D5DB] dark:bg-[#1F2023] dark:text-[#F1F5F9] dark:border-[#374151]',
};

const VARIANTS: IdentityStickerVariant[] = ['slate', 'sage', 'teal', 'stone', 'charcoal'];

function getDeterministicVariant(key: string): IdentityStickerVariant {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % VARIANTS.length;
  return VARIANTS[idx];
}

function getDeterministicTilt(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const fraction = Math.abs(hash % 37) / 36; // 0.0 to 1.0
  // Map to [-1.8, 1.8] degrees to guarantee strictly within [-2.0, 2.0]
  return Math.round((-1.8 + fraction * 3.6) * 10) / 10;
}

export const IdentitySticker: React.FC<IdentityStickerProps> = ({
  glyph = '🌿',
  name,
  showLabel = false,
  rotation,
  size = 'md',
  variant,
  className,
  title,
  style,
  ...rest
}) => {
  const angle = useMemo(() => {
    if (typeof rotation === 'number') return rotation;
    return getDeterministicTilt(name || glyph);
  }, [rotation, name, glyph]);

  const activeVariant = useMemo(() => {
    if (variant) return variant;
    return getDeterministicVariant(name || glyph);
  }, [variant, name, glyph]);

  const sizeClasses = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-11 h-11 text-xl',
  }[size];

  const ariaLabel = (rest as any)['aria-label'] || (name ? `${name}'s sticker` : `Sticker: ${glyph}`);
  const tooltipText = title || name || glyph;

  return (
    <span className="inline-flex items-center gap-1.5 align-middle select-none">
      <motion.span
        role="img"
        aria-label={ariaLabel}
        title={tooltipText}
        whileHover={{ scale: 1.06, rotate: angle > 0 ? angle + 0.5 : angle - 0.5 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        style={{
          transform: `rotate(${angle}deg)`,
          ...style,
        }}
        className={clsx(
          'identity-sticker inline-flex items-center justify-center rounded-xl border shadow-[0_2px_0_rgba(0,0,0,0.06)] transition-all',
          VARIANT_CLASSES[activeVariant],
          sizeClasses,
          className
        )}
        {...rest}
      >
        <span className="leading-none select-none filter contrast-105" aria-hidden="true">
          {glyph}
        </span>
      </motion.span>
      {showLabel && name && (
        <span className="text-xs font-medium text-ink-secondary dark:text-slate-300">
          {name}
        </span>
      )}
    </span>
  );
};

export default IdentitySticker;
