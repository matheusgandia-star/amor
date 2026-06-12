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
  title = 'Sabonetes artesanais feitos com amor',
  subtitle = 'Produtos naturais para cuidar de você',
  whatsapp = '11986305013',
}: HeroProps) {
  const waLink = `https://wa.me/55${whatsapp.replace(/\D/g, '')}`;
  const hasBanner = bannerUrl || bannerMobileUrl;

  return (
    <section className="relative overflow-hidden bg-[var(--aed-pink-mist)]">
      {hasBanner ? (
        <div className="relative w-full">
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt="Banner"
              className={`w-full object-cover max-h-[600px] ${bannerMobileUrl ? 'hidden md:block' : ''}`}
            />
          )}
          {bannerMobileUrl && (
            <img
              src={bannerMobileUrl}
              alt="Banner"
              className={`w-full object-cover max-h-[500px] ${bannerUrl ? 'md:hidden' : ''}`}
            />
          )}
          <div className="absolute inset-0 bg-black/20 flex items-end pb-12 px-6 md:px-16">
            <div className="max-w-lg">
              <h1 className="font-display text-4xl md:text-5xl font-light text-white leading-tight mb-3">
                {title}
              </h1>
              <p className="text-white/90 text-base mb-6">{subtitle}</p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--aed-pink)] text-white font-medium rounded-pill hover:bg-[var(--aed-pink-deep)] transition-colors"
              >
                <MessageCircle size={16} />
                Fale conosco
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-light text-[var(--fg-1)] leading-tight mb-4">
            {title}
          </h1>
          <p className="text-[var(--fg-2)] text-lg mb-8">{subtitle}</p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--aed-pink)] text-white font-medium rounded-pill hover:bg-[var(--aed-pink-deep)] transition-colors"
          >
            <MessageCircle size={16} />
            Fale conosco
          </a>
        </div>
      )}
    </section>
  );
}
