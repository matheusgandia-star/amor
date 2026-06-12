import Image from 'next/image';

interface FooterProps {
  whatsapp?: string;
  instagram?: string;
}

export default function Footer({ whatsapp = '11986305013', instagram = '@amoremdia.atelie' }: FooterProps) {
  const waLink = `https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! 🩷')}`;
  const igHandle = instagram.replace('@', '');

  return (
    <footer style={{
      background: 'var(--bg-surface-2)',
      padding: 'clamp(48px, 7vw, 72px) clamp(20px, 5vw, 32px) 32px',
      borderTop: '1px solid var(--aed-line)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between', alignItems: 'flex-start' }}>

        {/* Brand */}
        <div style={{ minWidth: 200 }}>
          <Image
            src="/assets/logo-pink-outline-horizontal.png"
            alt="Amor em Dia"
            width={160}
            height={64}
            style={{ height: 52, width: 'auto', marginBottom: 12 }}
          />
          <p style={{
            fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6,
            maxWidth: 260, fontFamily: 'var(--font-body)', margin: 0,
          }}>
            Sabonetes e produtos artesanais, feitos à mão com carinho por Ana Gandia.
          </p>
        </div>

        {/* Redes sociais */}
        <div>
          <p style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '.12em', color: 'var(--fg-3)', marginBottom: 16,
          }}>Redes sociais</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              textDecoration: 'none', fontSize: 13, fontWeight: 500,
              color: 'var(--fg-1)', fontFamily: 'var(--font-body)',
              transition: 'color var(--dur-base)',
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 999,
                background: '#25D366', color: '#fff', flexShrink: 0,
                boxShadow: 'var(--shadow-xs)',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </span>
              WhatsApp
            </a>
            <a href={`https://instagram.com/${igHandle}`} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              textDecoration: 'none', fontSize: 13, fontWeight: 500,
              color: 'var(--fg-1)', fontFamily: 'var(--font-body)',
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 999,
                background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                color: '#fff', flexShrink: 0,
                boxShadow: 'var(--shadow-xs)',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </span>
              {instagram}
            </a>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: 1200, margin: '48px auto 0', paddingTop: 20,
        borderTop: '1px solid var(--aed-line)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 8,
        fontSize: 12, color: 'var(--fg-3)',
      }}>
        <span>© 2026 Amor em Dia — feito à mão no Brasil 🩷</span>
        <span style={{ fontFamily: 'var(--font-script)', fontSize: 16, color: 'var(--aed-pink-signature)' }}>
          by Ana Gandia
        </span>
      </div>
    </footer>
  );
}
