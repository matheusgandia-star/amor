import { createClient } from '@/lib/supabase/server';
import Header from '@/components/shop/Header';
import Hero from '@/components/shop/Hero';
import ProductGrid from '@/components/shop/ProductGrid';
import NossaHistoria from '@/components/shop/NossaHistoria';
import Footer from '@/components/shop/Footer';
import type { Product, Category, SiteSettings } from '@/types';

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }, { data: settingsRow }] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
    supabase.from('settings').select('*').eq('id', 1).single(),
  ]);

  const settings = settingsRow as SiteSettings | null;

  return (
    <main>
      <Header whatsapp={settings?.whatsapp} />
      <Hero
        bannerUrl={settings?.banner_url}
        bannerMobileUrl={settings?.banner_mobile_url}
        title={settings?.hero_title}
        subtitle={settings?.hero_subtitle}
        whatsapp={settings?.whatsapp}
      />
      <ProductGrid
        products={(products as Product[]) ?? []}
        categories={(categories as Category[]) ?? []}
        whatsapp={settings?.whatsapp}
      />
      <NossaHistoria historiaImgUrl={settings?.historia_img_url} />
      <Footer whatsapp={settings?.whatsapp} instagram={settings?.instagram} />
    </main>
  );
}
