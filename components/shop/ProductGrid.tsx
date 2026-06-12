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
  const [activecat, setActivecat] = useState<string>('all');
  const [selected, setSelected] = useState<Product | null>(null);

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
  const filtered = activecat === 'all' ? products : products.filter(p => p.cat === activecat);

  return (
    <section id="produtos" className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="font-display text-3xl md:text-4xl font-light text-center text-[var(--fg-1)] mb-8">
        Nossos Produtos
      </h2>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        <button
          onClick={() => setActivecat('all')}
          className={`px-4 py-1.5 rounded-pill text-sm transition-colors ${
            activecat === 'all'
              ? 'bg-[var(--aed-pink)] text-white'
              : 'bg-[var(--aed-pink-mist)] text-[var(--fg-2)] hover:bg-[var(--aed-pink-blush)]'
          }`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActivecat(cat.id)}
            className={`px-4 py-1.5 rounded-pill text-sm transition-colors ${
              activecat === cat.id
                ? 'bg-[var(--aed-pink)] text-white'
                : 'bg-[var(--aed-pink-mist)] text-[var(--fg-2)] hover:bg-[var(--aed-pink-blush)]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            category={catMap[p.cat]}
            whatsapp={whatsapp}
            onOpen={setSelected}
          />
        ))}
      </div>

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
