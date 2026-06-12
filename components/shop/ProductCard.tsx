'use client';
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import type { Product, Category } from '@/types';

interface ProductCardProps {
  product: Product;
  category?: Category;
  whatsapp?: string;
  onOpen?: (product: Product) => void;
}

export function ProductCard({ product, category, whatsapp = '11986305013', onOpen }: ProductCardProps) {
  const waMsg = encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name}`);
  const waLink = `https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${waMsg}`;
  const thumb = product.photos?.[0];

  return (
    <div
      className="bg-[var(--bg-surface)] rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onOpen?.(product)}
      style={{ borderTop: `3px solid ${product.color || 'var(--aed-pink-mist)'}` }}
    >
      <div className="aspect-square overflow-hidden bg-[var(--bg-surface-2)]">
        {thumb ? (
          <img src={thumb} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: product.color || 'var(--aed-pink-mist)' }}>
            <span className="text-4xl">🧼</span>
          </div>
        )}
      </div>
      <div className="p-3">
        {category && (
          <span className="text-xs text-[var(--fg-3)] uppercase tracking-wide">{category.name}</span>
        )}
        <h3 className="font-display text-lg font-light text-[var(--fg-1)] mt-0.5">{product.name}</h3>
        {product.sub && <p className="text-xs text-[var(--fg-2)] mt-0.5 line-clamp-2">{product.sub}</p>}
        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-[var(--aed-pink-deep)]">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--aed-pink)] text-white text-xs font-medium rounded-pill hover:bg-[var(--aed-pink-deep)] transition-colors"
          >
            <MessageCircle size={12} />
            Pedir
          </a>
        </div>
      </div>
    </div>
  );
}
