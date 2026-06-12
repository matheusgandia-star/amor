'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Menu, X } from 'lucide-react';

interface HeaderProps {
  whatsapp?: string;
}

export default function Header({ whatsapp = '11986305013' }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const waLink = `https://wa.me/55${whatsapp.replace(/\D/g, '')}`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[var(--aed-line)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/assets/logo-pink-outline-horizontal.png"
            alt="Amor em Dia"
            width={140}
            height={40}
            className="object-contain"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm text-[var(--fg-2)] hover:text-[var(--aed-pink-deep)] transition-colors">Início</Link>
          <Link href="/#produtos" className="text-sm text-[var(--fg-2)] hover:text-[var(--aed-pink-deep)] transition-colors">Produtos</Link>
          <Link href="/#nossa-historia" className="text-sm text-[var(--fg-2)] hover:text-[var(--aed-pink-deep)] transition-colors">Nossa história</Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-[var(--aed-pink)] text-white text-sm font-medium rounded-pill hover:bg-[var(--aed-pink-deep)] transition-colors"
          >
            <MessageCircle size={15} />
            WhatsApp
          </a>
          <button
            className="md:hidden p-2 text-[var(--fg-2)]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[var(--aed-line)] bg-white px-4 py-4 flex flex-col gap-4">
          <Link href="/" className="text-sm text-[var(--fg-1)]" onClick={() => setMenuOpen(false)}>Início</Link>
          <Link href="/#produtos" className="text-sm text-[var(--fg-1)]" onClick={() => setMenuOpen(false)}>Produtos</Link>
          <Link href="/#nossa-historia" className="text-sm text-[var(--fg-1)]" onClick={() => setMenuOpen(false)}>Nossa história</Link>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--aed-pink)] text-white text-sm font-medium rounded-pill w-fit"
          >
            <MessageCircle size={15} />
            WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
