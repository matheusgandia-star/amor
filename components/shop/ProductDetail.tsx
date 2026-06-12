'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import type { Product, Category } from '@/types';

interface ProductDetailProps {
  product: Product;
  category?: Category;
  whatsapp?: string;
  onClose: () => void;
}

type Tab = 'desc' | 'ingredientes' | 'ritual';

export default function ProductDetail({ product: p, category, whatsapp = '11986305013', onClose }: ProductDetailProps) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [tab, setTab] = useState<Tab>('desc');
  const waMsg = encodeURIComponent(`Olá, Ana! 🩷 Tenho interesse no produto "${p.name}"${p.sub ? ` (${p.sub})` : ''} — R$ ${Number(p.price).toFixed(2).replace('.', ',')}. Ainda está disponível?`);
  const waLink = `https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${waMsg}`;
  const photos = p.photos?.filter(Boolean) ?? [];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const tabLabel = { desc: 'Descrição', ingredientes: 'Ingredientes', ritual: 'Ritual' };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(60,42,45,0.5)',
      zIndex: 200, overflowY: 'auto',
    }} onClick={onClose}>
      <section
        style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px 80px' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 18px 9px 14px',
          borderRadius: 'var(--r-pill)',
          border: '1.5px solid var(--aed-line-strong)',
          background: 'var(--bg-surface)',
          color: 'var(--fg-2)',
          fontSize: 13, fontWeight: 600,
          cursor: 'pointer', marginBottom: 28,
          fontFamily: 'var(--font-body)',
          boxShadow: 'var(--shadow-xs)',
          transition: 'all 200ms ease',
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--aed-pink-mist)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--aed-pink)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--aed-pink-deep)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--aed-line-strong)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-2)';
          }}
        >
          <ChevronLeft size={15} />
          Voltar ao catálogo
        </button>

        <div className="aed-pdp-grid" style={{ background: 'var(--bg-page)', borderRadius: 'var(--r-xl)', padding: 32 }}>
          {/* Fotos */}
          <div>
            <div style={{
              aspectRatio: '1/1', borderRadius: 'var(--r-xl)',
              background: `linear-gradient(135deg, ${p.color || '#F4A6AC'}, var(--aed-cream))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)', marginBottom: 12,
              position: 'relative', overflow: 'hidden',
            }}>
              {photos[activePhoto] ? (
                <img src={photos[activePhoto]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '58%', aspectRatio: '1.2/1', borderRadius: 'var(--r-md)',
                  background: p.accent || '#E88A92', opacity: .88,
                  boxShadow: 'inset 0 6px 18px rgba(255,255,255,.35), inset 0 -6px 18px rgba(0,0,0,.06)',
                }} />
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {[0, 1, 2, 3].map(i => {
                const photo = photos[i];
                return (
                  <div key={i} onClick={() => photo && setActivePhoto(i)} style={{
                    aspectRatio: '1/1', borderRadius: 'var(--r-md)', overflow: 'hidden',
                    background: photo ? 'transparent' : 'var(--bg-surface-2)',
                    border: activePhoto === i ? '1.5px solid var(--aed-pink)' : '1px solid var(--aed-line)',
                    opacity: activePhoto === i ? 1 : (photo ? 0.7 : 0.4),
                    cursor: photo ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                  }}>
                    {photo && <img src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div style={{ paddingTop: 8 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '.14em', color: 'var(--aed-pink-deep)',
            }}>
              {category?.name || ''}
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 400,
              fontSize: 42, color: 'var(--fg-1)', margin: '10px 0 8px', lineHeight: 1.1,
            }}>{p.name}</h1>
            <div style={{
              fontFamily: 'var(--font-script)', fontSize: 20,
              color: 'var(--aed-pink-signature)', marginBottom: 24,
            }}>
              feito à mão por Ana
            </div>
            <div style={{ fontSize: 28, color: 'var(--fg-1)', fontWeight: 500, marginBottom: 24 }}>
              R$ {Number(p.price).toFixed(2).replace('.', ',')}
            </div>

            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', textDecoration: 'none', fontFamily: 'var(--font-body)',
              fontSize: 15, fontWeight: 600, color: '#fff',
              background: '#25D366', padding: '16px 30px',
              borderRadius: 'var(--r-pill)', boxShadow: 'var(--shadow-sm)',
              marginBottom: 24,
            }}>
              <MessageCircle size={18} />
              Falar no WhatsApp
            </a>

            <div style={{
              display: 'flex', gap: 18, fontSize: 12, color: 'var(--fg-3)',
              padding: '16px 0', borderTop: '1px solid var(--aed-line)',
            }}>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <MessageCircle size={14} />Pedidos pelo WhatsApp
              </span>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                🌿 Vegano & cruelty-free
              </span>
            </div>

            {/* Tabs */}
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--aed-line)' }}>
                {(['desc', 'ingredientes', 'ritual'] as Tab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    background: 'none', border: 'none', padding: '10px 0', fontSize: 13,
                    fontFamily: 'var(--font-body)', cursor: 'pointer',
                    color: tab === t ? 'var(--aed-pink-deep)' : 'var(--fg-3)',
                    fontWeight: tab === t ? 600 : 400,
                    borderBottom: tab === t ? '2px solid var(--aed-pink)' : '2px solid transparent',
                    marginBottom: -1,
                  }}>{tabLabel[t]}</button>
                ))}
              </div>
              <div style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.7, padding: '16px 0' }}>
                {tab === 'desc' && (p.descricao || 'Produto artesanal feito com carinho.')}
                {tab === 'ingredientes' && (p.ingredientes || 'Informações sobre ingredientes em breve.')}
                {tab === 'ritual' && (p.ritual || 'Informações sobre o ritual de uso em breve.')}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
