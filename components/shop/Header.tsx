'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Menu, X } from 'lucide-react';

interface HeaderProps {
  whatsapp?: string;
}

export default function Header({ whatsapp = '11986305013' }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const waLink = `https://wa.me/55${whatsapp.replace(/\D/g, '')}`;

  const links = [
    { id: 'home', label: 'Início', href: '/' },
    { id: 'shop', label: 'Produtos', href: '/#produtos' },
    { id: 'sobre', label: 'Nossa história', href: '/#nossa-historia' },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,253,251,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--aed-line)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', height: 72,
        display: 'flex', alignItems: 'center', gap: 24, padding: '0 32px',
      }}>
        {/* hambúrguer mobile */}
        <button className="aed-burger" aria-label="Menu" onClick={() => setMenuOpen(v => !v)} style={{
          width: 42, height: 42, borderRadius: 999,
          border: '1px solid var(--aed-line)',
          background: 'var(--bg-surface)', cursor: 'pointer',
          color: 'var(--fg-1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-pink-outline-horizontal.png" alt="Amor em Dia" style={{ height: 36, width: 'auto', display: 'block' }} />
        </Link>

        <nav className="aed-navlinks" style={{ display: 'flex', gap: 28, marginLeft: 32 }}>
          {links.map(l => (
            <Link key={l.id} href={l.href} style={{
              fontSize: 14, color: 'var(--fg-2)', textDecoration: 'none',
              fontWeight: 400, letterSpacing: '.01em',
              transition: 'color var(--dur-base)',
              fontFamily: 'var(--font-body)',
            }}>{l.label}</Link>
          ))}
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            textDecoration: 'none', fontFamily: 'var(--font-body)',
            fontSize: 14, fontWeight: 600, color: '#fff',
            background: '#25D366', padding: '10px 18px',
            borderRadius: 'var(--r-pill)', boxShadow: 'var(--shadow-sm)',
            marginLeft: 4, whiteSpace: 'nowrap',
          }}>
            <MessageCircle size={17} />
            <span className="aed-wa-label">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* menu mobile */}
      <div className="aed-mobile-menu" style={{
        display: 'none',
        overflow: 'hidden',
        maxHeight: menuOpen ? 320 : 0,
        transition: 'max-height var(--dur-slow) var(--ease-soft)',
        borderTop: menuOpen ? '1px solid var(--aed-line)' : '1px solid transparent',
        background: 'var(--bg-page)',
      }}>
        <nav style={{ display: 'flex', flexDirection: 'column', padding: '8px 18px 16px' }}>
          {links.map(l => (
            <Link key={l.id} href={l.href} onClick={() => setMenuOpen(false)} style={{
              padding: '14px 6px', fontSize: 16, textDecoration: 'none',
              color: 'var(--fg-1)', fontWeight: 500,
              borderBottom: '1px solid var(--aed-line)',
            }}>{l.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
