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
      padding: '72px 32px 32px',
      borderTop: '1px solid var(--aed-line)',
    }}>
      <div className="aed-footer-grid" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div>
          <Image
            src="/assets/logo-pink-outline-horizontal.png"
            alt="Amor em Dia"
            width={160}
            height={64}
            style={{ height: 64, width: 'auto', marginBottom: 16 }}
          />
          <p style={{
            fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6,
            maxWidth: 280, fontFamily: 'var(--font-body)',
          }}>
            Sabonetes e produtos artesanais, feitos à mão com carinho por Ana Gandia.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 44, height: 44, borderRadius: 999,
            background: '#25D366', color: '#fff',
            textDecoration: 'none', boxShadow: 'var(--shadow-sm)',
          }} title="WhatsApp">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </a>
          <a href={`https://instagram.com/${igHandle}`} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 44, height: 44, borderRadius: 999,
            background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            color: '#fff', textDecoration: 'none', boxShadow: 'var(--shadow-sm)',
          }} title="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
        </div>
      </div>
      <div style={{
        maxWidth: 1200, margin: '56px auto 0', paddingTop: 24,
        borderTop: '1px solid var(--aed-line)',
        display: 'flex', justifyContent: 'space-between',
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
