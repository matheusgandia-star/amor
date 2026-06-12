'use client';
import { MessageCircle } from 'lucide-react';

interface HeroProps {
  bannerUrl?: string;
  bannerMobileUrl?: string;
  title?: string;
  subtitle?: string;
  whatsapp?: string;
}

export default function Hero({
  bannerUrl,
  bannerMobileUrl,
  title = 'Amor em cada detalhe',
  subtitle = 'Sabonetes e produtos artesanais criados com ingredientes selecionados, aromas que despertam memórias e muito carinho em cada detalhe.',
  whatsapp = '11986305013',
}: HeroProps) {
  const waLink = `https://wa.me/55${whatsapp.replace(/\D/g, '')}`;

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
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '.14em', color: 'var(--aed-pink-deep)', marginBottom: 16,
          }}>· Coleção ·</div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(42px, 5.2vw, 68px)', lineHeight: 1.05,
            color: 'var(--aed-pink-deep)', margin: '0 0 8px',
            letterSpacing: '-0.01em',
          }}>
            {title}{' '}
            <span style={{ fontFamily: 'var(--font-script)', color: 'var(--aed-pink-signature)', fontWeight: 400 }}>
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

          <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            textDecoration: 'none', fontFamily: 'var(--font-body)',
            fontSize: 15, fontWeight: 600, color: '#fff',
            background: '#25D366', padding: '16px 30px',
            borderRadius: 'var(--r-pill)', boxShadow: 'var(--shadow-sm)',
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
              flexDirection: 'column', gap: 8,
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--aed-pink-deep)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--fg-3)' }}>
                Adicione um banner no Admin
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
