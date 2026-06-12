'use client';
import { useState } from 'react';
import type { Product, Category } from '@/types';

interface ProductCardProps {
  product: Product;
  category?: Category;
  onOpen?: (product: Product) => void;
}

export function ProductCard({ product: p, category, onOpen }: ProductCardProps) {
  const [hover, setHover] = useState(false);
  const thumb = p.photos?.[0];

  return (
    <div
      onClick={() => onOpen?.(p)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all var(--dur-base) var(--ease-soft)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        position: 'relative', aspectRatio: '1/1',
        background: `linear-gradient(135deg, ${p.color || '#F4A6AC'}, var(--aed-cream))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {thumb ? (
          <img src={thumb} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '62%', aspectRatio: '1.2/1', borderRadius: 'var(--r-md)',
            background: p.accent || '#E88A92', opacity: 0.85,
            boxShadow: 'inset 0 4px 14px rgba(255,255,255,.35), inset 0 -4px 14px rgba(0,0,0,.06)',
          }} />
        )}
      </div>

      <div style={{ padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{
          fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em',
          color: 'var(--aed-pink-deep)', fontWeight: 600,
        }}>
          {category?.name || p.sub}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 500,
          fontSize: 18, color: 'var(--fg-1)',
        }}>
          {p.name}
        </div>
        <div style={{
          fontSize: 14, color: 'var(--fg-1)', fontWeight: 600, marginTop: 4,
        }}>
          R$ {Number(p.price).toFixed(2).replace('.', ',')}
        </div>
      </div>
    </div>
  );
}
