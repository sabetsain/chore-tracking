import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IdentitySticker } from './IdentitySticker';

describe('IdentitySticker', () => {
  it('renders domestic glyphs with accessible role and aria-label', () => {
    render(<IdentitySticker glyph="☕" name="Alex" />);
    const sticker = screen.getByRole('img');
    expect(sticker).toBeInTheDocument();
    expect(sticker).toHaveAttribute('aria-label', expect.stringMatching(/Alex|☕/));
    expect(sticker).toHaveTextContent('☕');
  });

  it('renders die-cut styling with rounded-xl and micro-shadow', () => {
    render(<IdentitySticker glyph="🌿" data-testid="die-cut-sticker" />);
    const sticker = screen.getByTestId('die-cut-sticker');
    expect(sticker.className).toMatch(/rounded-xl/);
    expect(sticker.className).toContain('shadow-[0_2px_0_rgba(0,0,0,0.06)]');
  });

  it('applies rotational tilt within ±2°', () => {
    const glyphs = ['☕', '🌿', '🐱', '☀️', '🧽', '♻', '🧺'];
    for (const g of glyphs) {
      const { unmount } = render(
        <IdentitySticker glyph={g} name={g} data-testid={`sticker-${g}`} />
      );
      const el = screen.getByTestId(`sticker-${g}`);
      const transform = el.style.transform;
      const match = transform.match(/rotate\((-?[\d.]+)deg\)/);
      expect(match).not.toBeNull();
      const deg = parseFloat(match![1]);
      expect(deg).toBeGreaterThanOrEqual(-2.0);
      expect(deg).toBeLessThanOrEqual(2.0);
      unmount();
    }
  });

  it('accepts a custom rotation prop', () => {
    render(
      <IdentitySticker
        glyph="🐱"
        rotation={-1.8}
        data-testid="custom-rotate-sticker"
      />
    );
    const sticker = screen.getByTestId('custom-rotate-sticker');
    expect(sticker.style.transform).toContain('rotate(-1.8deg)');
  });

  it('renders optional name label when showLabel is true', () => {
    render(<IdentitySticker glyph="☀️" name="Sam" showLabel />);
    expect(screen.getByText('Sam')).toBeInTheDocument();
    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  it('supports slate, sage, teal, stone, and charcoal variants', () => {
    const variants = ['slate', 'sage', 'teal', 'stone', 'charcoal'] as const;
    for (const v of variants) {
      const { unmount } = render(<IdentitySticker glyph="🌿" variant={v} data-testid={`sticker-${v}`} />);
      const sticker = screen.getByTestId(`sticker-${v}`);
      expect(sticker).toBeInTheDocument();
      unmount();
    }
  });
});
