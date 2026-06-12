'use client';
import { MessageCircle } from 'lucide-react';

interface HeroProps {
  bannerUrl?: string;
  bannerMobileUrl?: string;
  title?: string;
  subtitle?: string;
  whatsapp?: string;
}

const BADGES = [
  { icon: '🌿', text: 'Ingredientes naturais' },
  { icon: '🤍', text: 'Feito à mão' },
  { icon: '🌸', text: 'Aromas exclusivos' },
];

export default function Hero({
  bannerUrl,
  bannerMobileUrl,
  title,
  subtitle = 'Sabonetes e produtos artesanais criados com ingredientes selecionados, aromas que despertam memórias e muito carinho em cada detalhe.',
  whatsapp = '11986305013',
}: HeroProps) {
  const waLink = `https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Quero ver a coleção 🩷')}`;

  const titleLines = title
    ? [title, null]
    : ['Amor em cada', 'detalhe'];

  return (
    <section style={{
      background: 'linear-gradient(180deg, var(--aed-pink-mist) 0%, var(--aed-paper) 100%)',
      padding: '80px 32px 96px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="aed-hero-grid" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Texto */}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '.14em', color: 'var(--aed-pink-deep)',
            marginBottom: 20,
          }}>
            <span style={{ width: 20, height: 1, background: 'var(--aed-pink)' }} />
            Coleção
            <span style={{ width: 20, height: 1, background: 'var(--aed-pink)' }} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(42px, 5.2vw, 68px)', lineHeight: 1.05,
            color: 'var(--aed-pink-deep)', margin: '0 0 8px',
            letterSpacing: '-0.01em',
          }}>
            {titleLines[0]}<br />
            {titleLines[1]}{' '}
            <span style={{ fontFamily: 'var(--font-script)', color: 'var(--aed-pink-signature)', fontWeight: 400, fontSize: '1.1em' }}>
              feito à mão
            </span>
          </h1>

          <p style={{
            fontSize: 17, lineHeight: 1.6, color: 'var(--fg-2)',
            maxWidth: 460, margin: '20px 0 32px',
            fontFamily: 'var(--font-body)',
          }}>
            {subtitle}
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
            {BADGES.map(b => (
              <div key={b.text} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                fontSize: 12.5, fontWeight: 500, color: 'var(--fg-2)',
                background: 'var(--bg-surface)', border: '1px solid var(--aed-line)',
                borderRadius: 'var(--r-pill)', padding: '7px 14px',
                boxShadow: 'var(--shadow-xs)',
              }}>
                <span>{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>

          <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            textDecoration: 'none', fontFamily: 'var(--font-body)',
            fontSize: 15, fontWeight: 600, color: '#fff',
            background: 'var(--aed-pink-deep)', padding: '16px 30px',
            borderRadius: 'var(--r-pill)', boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--dur-base) var(--ease-soft)',
          }}>
            <MessageCircle size={18} />
            Descubra a coleção
          </a>
        </div>

        {/* Imagem */}
        <div className="aed-hero-art" style={{ position: 'relative', aspectRatio: '4/5', maxHeight: 520 }}>
          {bannerUrl || bannerMobileUrl ? (
            <img
              src={bannerUrl || bannerMobileUrl}
              alt="Banner Amor em Dia"
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-md)',
              }}
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 'var(--r-xl)',
              background: 'linear-gradient(145deg, var(--aed-pink-soft), var(--aed-cream) 70%)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 12,
            }}>
              <div style={{ fontSize: 48 }}>🩷</div>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: 22, color: 'var(--aed-pink-deep)' }}>
                Amor em Dia
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', maxWidth: 160 }}>
                Adicione um banner no Admin
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
