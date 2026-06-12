'use client';
import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    setEmail('');
  }

  return (
    <section style={{
      background: 'linear-gradient(135deg, var(--aed-pink-mist) 0%, var(--aed-cream) 100%)',
      padding: '80px 32px',
      borderTop: '1px solid var(--aed-line)',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '.14em', color: 'var(--aed-pink-deep)', marginBottom: 16,
        }}>
          · Newsletter ·
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 300,
          fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15,
          color: 'var(--fg-1)', margin: '0 0 8px',
        }}>
          Fique por dentro das{' '}
          <span style={{ fontFamily: 'var(--font-script)', color: 'var(--aed-pink-deep)', fontWeight: 400 }}>
            novidades
          </span>
        </h2>

        <p style={{
          fontSize: 15, lineHeight: 1.6, color: 'var(--fg-2)',
          margin: '16px 0 36px',
        }}>
          Lançamentos, promoções exclusivas e dicas de cuidados artesanais direto no seu e-mail.
        </p>

        {sent ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-surface)', border: '1px solid var(--aed-line)',
            borderRadius: 'var(--r-pill)', padding: '16px 28px',
            fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--aed-success)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            🌸 Obrigada! Você receberá nossas novidades em breve.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            display: 'flex', gap: 10, maxWidth: 460, margin: '0 auto',
          }}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              style={{
                flex: 1, padding: '14px 20px',
                borderRadius: 'var(--r-pill)',
                border: '1px solid var(--aed-line)',
                fontFamily: 'var(--font-body)', fontSize: 14,
                color: 'var(--fg-1)', outline: 'none',
                background: 'var(--bg-surface)',
                boxShadow: 'var(--shadow-xs)',
              }}
            />
            <button type="submit" style={{
              padding: '14px 24px', borderRadius: 'var(--r-pill)',
              border: 'none', cursor: 'pointer',
              background: 'var(--aed-pink-deep)', color: '#fff',
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--dur-base) var(--ease-soft)',
              whiteSpace: 'nowrap',
            }}>
              Quero receber
            </button>
          </form>
        )}

        <p style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 16 }}>
          Sem spam. Cancele quando quiser. 🩷
        </p>
      </div>
    </section>
  );
}
