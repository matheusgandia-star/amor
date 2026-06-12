export default function NossaHistoria({ historiaImgUrl }: { historiaImgUrl?: string }) {
  return (
    <section id="nossa-historia" style={{
      background: 'var(--aed-cream)',
      padding: 'clamp(56px, 8vw, 96px) clamp(20px, 5vw, 32px)',
      borderTop: '1px solid var(--aed-line)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 64, alignItems: 'center',
      }}
        className="aed-historia-grid"
      >
        {/* Visual */}
        <div style={{ position: 'relative' }}>
          <div style={{
            borderRadius: 'var(--r-xl)',
            background: 'linear-gradient(145deg, var(--aed-pink-soft), var(--aed-cream) 70%)',
            aspectRatio: '1/1', maxWidth: 480,
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 16,
            boxShadow: 'var(--shadow-md)',
          }}>
            {historiaImgUrl ? (
              <img
                src={historiaImgUrl}
                alt="Nossa história"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <>
                <div style={{ fontSize: 72 }}>🧼</div>
                <div style={{ fontFamily: 'var(--font-script)', fontSize: 28, color: 'var(--aed-pink-deep)' }}>
                  Feito com amor
                </div>
              </>
            )}
          </div>
          {/* Badge flutuante */}
          <div className="aed-historia-badge" style={{
            position: 'absolute', bottom: 24, right: 0,
            background: 'var(--bg-surface)', borderRadius: 'var(--r-md)',
            padding: '16px 20px', boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--aed-line)',
          }}>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: 20, color: 'var(--aed-pink-deep)', marginBottom: 4 }}>
              Ana Gandia
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--font-body)' }}>
              Fundadora & artesã
            </div>
          </div>
        </div>

        {/* Texto */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '.14em', color: 'var(--aed-pink-deep)', marginBottom: 20,
          }}>
            · Nossa história ·
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(30px, 3.5vw, 48px)', lineHeight: 1.15,
            color: 'var(--fg-1)', margin: '0 0 24px',
          }}>
            Cada sabonete carrega{' '}
            <span style={{ fontFamily: 'var(--font-script)', color: 'var(--aed-pink-deep)', fontWeight: 400 }}>
              um pedaço
            </span>{' '}
            de nós
          </h2>

          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--fg-2)', marginBottom: 20 }}>
            O Amor em Dia nasceu da paixão de Ana Gandia por criar produtos naturais que fazem bem para o corpo e para a alma. Tudo começa na bancada do ateliê, com ingredientes cuidadosamente selecionados e muito carinho em cada etapa do processo.
          </p>

          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--fg-2)', marginBottom: 32 }}>
            Acreditamos que o cuidado pessoal é um ato de amor — por isso cada sabonete é embalado e entregue com a mesma atenção que colocamos ao fazê-lo.
          </p>

        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .aed-historia-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .aed-historia-badge { right: 16px !important; bottom: 16px !important; }
        }
      `}</style>
    </section>
  );
}
