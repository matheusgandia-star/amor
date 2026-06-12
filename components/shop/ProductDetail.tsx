'use client';
import { useState, useEffect } from 'react';
import { X, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product, Category } from '@/types';

interface ProductDetailProps {
  product: Product;
  category?: Category;
  whatsapp?: string;
  onClose: () => void;
}

type Tab = 'descricao' | 'ingredientes' | 'ritual';

export default function ProductDetail({ product, category, whatsapp = '11986305013', onClose }: ProductDetailProps) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [tab, setTab] = useState<Tab>('descricao');
  const photos = product.photos?.filter(Boolean) ?? [];
  const waMsg = encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name}`);
  const waLink = `https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${waMsg}`;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex md:flex-row flex-col">
          {/* Photos */}
          <div className="md:w-1/2 bg-[var(--bg-surface-2)]">
            {photos.length > 0 ? (
              <div className="relative aspect-square">
                <img src={photos[photoIdx]} alt={product.name} className="w-full h-full object-cover rounded-tl-lg" />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1"
                    ><ChevronLeft size={18} /></button>
                    <button
                      onClick={() => setPhotoIdx(i => (i + 1) % photos.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1"
                    ><ChevronRight size={18} /></button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPhotoIdx(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${i === photoIdx ? 'bg-[var(--aed-pink)]' : 'bg-white/60'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center" style={{ background: product.color }}>
                <span className="text-6xl">🧼</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:w-1/2 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-1">
              <div>
                {category && <span className="text-xs text-[var(--fg-3)] uppercase tracking-wide">{category.name}</span>}
                <h2 className="font-display text-2xl font-light text-[var(--fg-1)]">{product.name}</h2>
              </div>
              <button onClick={onClose} className="text-[var(--fg-3)] hover:text-[var(--fg-1)] ml-2 mt-1">
                <X size={20} />
              </button>
            </div>

            {product.sub && <p className="text-sm text-[var(--fg-2)] mb-4">{product.sub}</p>}

            <span className="text-xl font-semibold text-[var(--aed-pink-deep)] mb-4">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>

            {/* Tabs */}
            <div className="flex gap-1 mb-3 border-b border-[var(--aed-line)]">
              {(['descricao', 'ingredientes', 'ritual'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-2 px-1 text-sm capitalize transition-colors border-b-2 -mb-px ${
                    tab === t ? 'border-[var(--aed-pink)] text-[var(--aed-pink-deep)]' : 'border-transparent text-[var(--fg-3)]'
                  }`}
                >
                  {t === 'descricao' ? 'Descrição' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <p className="text-sm text-[var(--fg-2)] flex-1 leading-relaxed">
              {product[tab] || 'Nenhuma informação disponível.'}
            </p>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--aed-pink)] text-white font-medium rounded-pill hover:bg-[var(--aed-pink-deep)] transition-colors"
            >
              <MessageCircle size={16} />
              Pedir pelo WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
