'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SiteSettings } from '@/types';

const defaultSettings: Omit<SiteSettings, 'updated_at'> = {
  mode: 'catalogo', whatsapp: '11986305013', instagram: '@amoremdia.atelie',
  banner_url: '', banner_mobile_url: '',
  hero_title: 'Sabonetes artesanais feitos com amor',
  hero_subtitle: 'Produtos naturais para cuidar de você',
  seo_title: 'Amor em Dia — Sabonetes Artesanais',
  seo_description: 'Sabonetes artesanais naturais feitos com amor.',
  favicon_url: '',
};

export default function SettingsPanel() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) setSettings(data as SiteSettings);
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('settings').upsert({ id: 1, ...settings, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <p className="text-sm text-[var(--fg-3)]">Carregando...</p>;

  const field = (label: string, key: keyof typeof settings, type = 'text') => (
    <div>
      <label className="text-xs text-[var(--fg-3)] mb-1 block">{label}</label>
      <input
        type={type}
        value={(settings as any)[key] ?? ''}
        onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
        className="w-full border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)]"
      />
    </div>
  );

  return (
    <form onSubmit={handleSave} className="max-w-lg flex flex-col gap-5">
      <div>
        <label className="text-xs text-[var(--fg-3)] mb-1 block">Modo do site</label>
        <select
          value={settings.mode}
          onChange={e => setSettings(s => ({ ...s, mode: e.target.value as 'catalogo' | 'loja' }))}
          className="w-full border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)]"
        >
          <option value="catalogo">Catálogo (contato via WhatsApp)</option>
          <option value="loja">Loja (com carrinho e checkout)</option>
        </select>
      </div>

      {field('WhatsApp (somente números)', 'whatsapp')}
      {field('Instagram (com @)', 'instagram')}

      <hr className="border-[var(--aed-line)]" />
      <p className="text-xs font-semibold text-[var(--fg-3)] uppercase tracking-wide">Hero</p>
      {field('Título do hero', 'hero_title')}
      {field('Subtítulo do hero', 'hero_subtitle')}
      {field('URL do banner desktop', 'banner_url')}
      {field('URL do banner mobile', 'banner_mobile_url')}

      <hr className="border-[var(--aed-line)]" />
      <p className="text-xs font-semibold text-[var(--fg-3)] uppercase tracking-wide">SEO</p>
      {field('Título da página', 'seo_title')}
      {field('Descrição meta', 'seo_description')}
      {field('URL do favicon', 'favicon_url')}

      <button
        type="submit"
        disabled={saving}
        className="py-2.5 bg-[var(--aed-pink)] text-white font-medium rounded-sm hover:bg-[var(--aed-pink-deep)] transition-colors disabled:opacity-60"
      >
        {saved ? '✓ Salvo!' : saving ? 'Salvando...' : 'Salvar configurações'}
      </button>
    </form>
  );
}
