'use client';
import { useState } from 'react';
import { ProductCard } from './ProductCard';
import ProductDetail from './ProductDetail';
import type { Product, Category } from '@/types';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  whatsapp?: string;
}

export default function ProductGrid({ products, categories, whatsapp }: ProductGridProps) {
  const [activeCat, setActiveCat] = useState<string>('all');
  const [selected, setSelected] = useState<Product | null>(null);

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
  const filtered = activeCat === 'all' ? products : products.filter(p => p.cat === activeCat);

  const chipStyle = (active: boolean) => ({
    display: 'inline-flex', alignItems: 'center',
    fontSize: 13, padding: '8px 14px', borderRadius: 'var(--r-pill)',
    border: `1px solid ${active ? 'var(--aed-pink)' : 'var(--aed-line)'}`,
    background: active ? 'var(--aed-pink-mist)' : 'var(--bg-surface)',
    color: active ? 'var(--aed-pink-deep)' : 'var(--fg-2)',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    transition: 'all var(--dur-base) var(--ease-soft)',
    fontFamily: 'var(--font-body)',
  } as React.CSSProperties);

  return (
    <section id="produtos" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '.14em', color: 'var(--aed-pink-deep)', marginBottom: 10,
        }}>· Catálogo ·</div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 400,
          fontSize: 'clamp(30px, 3.2vw, 44px)', color: 'var(--fg-1)',
          margin: 0,
        }}>Nossos Produtos</h2>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
        <button style={chipStyle(activeCat === 'all')} onClick={() => setActiveCat('all')}>
          Tudo
        </button>
        {categories.map(cat => (
          <button key={cat.id} style={chipStyle(activeCat === cat.id)} onClick={() => setActiveCat(cat.id)}>
            {cat.name}
          </button>
        ))}
      </div>

      <div className="aed-pgrid">
        {filtered.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            category={catMap[p.cat]}
            onOpen={setSelected}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--fg-3)', padding: '40px 0' }}>
          Nenhum produto nesta categoria.
        </p>
      )}

      {selected && (
        <ProductDetail
          product={selected}
          category={catMap[selected.cat]}
          whatsapp={whatsapp}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
