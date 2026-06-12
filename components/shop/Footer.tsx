import { MessageCircle } from 'lucide-react';
import Image from 'next/image';

interface FooterProps {
  whatsapp?: string;
  instagram?: string;
}

export default function Footer({ whatsapp = '11986305013', instagram = '@amoremdia.atelie' }: FooterProps) {
  const waLink = `https://wa.me/55${whatsapp.replace(/\D/g, '')}`;
  const igHandle = instagram.replace('@', '');

  return (
    <footer className="bg-[var(--aed-pink-mist)] border-t border-[var(--aed-line)] py-10 mt-16">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <Image src="/assets/logo-pink-outline-horizontal.png" alt="Amor em Dia" width={120} height={36} className="object-contain" />
        <p className="text-sm text-[var(--fg-3)] text-center">
          Sabonetes artesanais feitos com amor ♡
        </p>
        <div className="flex gap-3">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--aed-pink)] text-white text-sm rounded-pill hover:bg-[var(--aed-pink-deep)] transition-colors"
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>
          <a
            href={`https://instagram.com/${igHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white text-[var(--fg-2)] text-sm rounded-pill border border-[var(--aed-line)] hover:bg-[var(--aed-pink-blush)] transition-colors"
          >
            📷 Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
