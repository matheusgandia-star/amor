'use client';
import { useEffect, useState, useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { SiteSettings } from '@/types';

const defaultSettings: Omit<SiteSettings, 'updated_at'> = {
  mode: 'catalogo', whatsapp: '11986305013', instagram: '@amoremdia.atelie',
  banner_url: '', banner_mobile_url: '', historia_img_url: '',
  hero_title: 'Sabonetes artesanais feitos com amor',
  hero_subtitle: 'Produtos naturais para cuidar de você',
  seo_title: 'Amor em Dia — Sabonetes Artesanais',
  seo_description: 'Sabonetes artesanais naturais feitos com amor.',
  favicon_url: '',
};

function compressImage(file: File, maxWidth = 1400): Promise<string> {
  return new Promise(res => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new window.Image();
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, 1);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        res(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = ev.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [dragging, setDragging] = useState(false);
  const [draggingH, setDraggingH] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const fileHistRef = useRef<HTMLInputElement>(null);
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
    await supabase.from('settings').upsert({
      id: 1, ...settings,
      banner_mobile_url: settings.banner_url,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleBannerFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const b64 = await compressImage(file);
    setSettings(s => ({ ...s, banner_url: b64, banner_mobile_url: b64 }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleBannerFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleBannerFile(file);
  }

  async function handleHistoriaFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const b64 = await compressImage(file, 900);
    setSettings(s => ({ ...s, historia_img_url: b64 }));
  }

  function handleHistoriaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleHistoriaFile(file);
    e.target.value = '';
  }

  function handleHistoriaDrop(e: React.DragEvent) {
    e.preventDefault();
    setDraggingH(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleHistoriaFile(file);
  }

  if (loading) return <p style={{ fontSize: 13, color: 'var(--fg-3)', padding: '24px 32px' }}>Carregando...</p>;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 'var(--r-sm)',
    border: '1px solid var(--aed-line-strong)', fontFamily: 'inherit',
    fontSize: 13, color: 'var(--fg-1)', outline: 'none', background: 'var(--bg-surface)',
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em',
    color: 'var(--fg-3)', fontWeight: 700, marginBottom: 14,
  };

  function Field({ label, k, type = 'text' }: { label: string; k: keyof typeof settings; type?: string }) {
    return (
      <div>
        <label style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', marginBottom: 5, fontWeight: 500 }}>{label}</label>
        <input
          type={type}
          value={(settings as any)[k] ?? ''}
          onChange={e => setSettings(s => ({ ...s, [k]: e.target.value }))}
          style={inputStyle}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} style={{ padding: '24px 32px', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ---- Modo ---- */}
      <div>
        <p style={sectionLabel}>Modo do site</p>
        <select
          value={settings.mode}
          onChange={e => setSettings(s => ({ ...s, mode: e.target.value as 'catalogo' | 'loja' }))}
          style={inputStyle}
        >
          <option value="catalogo">Catálogo (contato via WhatsApp)</option>
          <option value="loja">Loja (com carrinho e checkout)</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="WhatsApp (somente números)" k="whatsapp" />
        <Field label="Instagram (com @)" k="instagram" />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--aed-line)' }} />

      {/* ---- Banner ---- */}
      <div>
        <p style={sectionLabel}>Banner da loja</p>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragging ? 'var(--aed-pink)' : 'var(--aed-line-strong)'}`,
            borderRadius: 'var(--r-md)',
            background: dragging ? 'var(--aed-pink-blush)' : settings.banner_url ? 'transparent' : 'var(--aed-pink-mist)',
            cursor: 'pointer',
            transition: 'all var(--dur-base)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {settings.banner_url ? (
            <>
              <img
                src={settings.banner_url}
                alt="Banner"
                style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }}
              />
              {/* Overlay on hover */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,.35)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: 0, transition: 'opacity var(--dur-base)',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
              >
                <Upload size={22} color="#fff" />
                <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>Trocar imagem</span>
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setSettings(s => ({ ...s, banner_url: '', banner_mobile_url: '' })); }}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 28, height: 28, borderRadius: 999,
                  background: 'rgba(0,0,0,.5)', border: 'none',
                  color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={13} />
              </button>
            </>
          ) : (
            <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 48, height: 48, borderRadius: 999, background: 'var(--aed-pink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={22} color="var(--aed-pink-deep)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', margin: '0 0 4px' }}>Clique ou arraste uma imagem</p>
                <p style={{ fontSize: 11, color: 'var(--fg-3)', margin: 0 }}>JPG, PNG ou WEBP · Mesma imagem para desktop e mobile</p>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {settings.banner_url && (
          <p style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 8 }}>
            ✓ Banner salvo · usado no desktop e no mobile
          </p>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--aed-line)' }} />

      {/* ---- Nossa História image ---- */}
      <div>
        <p style={sectionLabel}>Imagem — Nossa História</p>

        <div
          onClick={() => fileHistRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDraggingH(true); }}
          onDragLeave={() => setDraggingH(false)}
          onDrop={handleHistoriaDrop}
          style={{
            border: `2px dashed ${draggingH ? 'var(--aed-pink)' : 'var(--aed-line-strong)'}`,
            borderRadius: 'var(--r-md)',
            background: draggingH ? 'var(--aed-pink-blush)' : settings.historia_img_url ? 'transparent' : 'var(--aed-pink-mist)',
            cursor: 'pointer',
            transition: 'all var(--dur-base)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {settings.historia_img_url ? (
            <>
              <img
                src={settings.historia_img_url}
                alt="Nossa História"
                style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,.35)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: 0, transition: 'opacity var(--dur-base)',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
              >
                <Upload size={22} color="#fff" />
                <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>Trocar imagem</span>
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setSettings(s => ({ ...s, historia_img_url: '' })); }}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 28, height: 28, borderRadius: 999,
                  background: 'rgba(0,0,0,.5)', border: 'none',
                  color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              ><X size={13} /></button>
            </>
          ) : (
            <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--aed-pink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={20} color="var(--aed-pink-deep)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', margin: '0 0 4px' }}>Clique ou arraste uma foto</p>
                <p style={{ fontSize: 11, color: 'var(--fg-3)', margin: 0 }}>Aparece na seção "Nossa História" do site</p>
              </div>
            </div>
          )}
        </div>

        <input ref={fileHistRef} type="file" accept="image/*" onChange={handleHistoriaChange} style={{ display: 'none' }} />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--aed-line)' }} />

      {/* ---- Hero texts ---- */}
      <div>
        <p style={sectionLabel}>Textos do hero</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Título" k="hero_title" />
          <Field label="Subtítulo" k="hero_subtitle" />
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--aed-line)' }} />

      {/* ---- SEO ---- */}
      <div>
        <p style={sectionLabel}>SEO</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Título da página" k="seo_title" />
          <Field label="Descrição meta" k="seo_description" />
          <Field label="URL do favicon" k="favicon_url" />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        style={{
          padding: '12px 28px', borderRadius: 'var(--r-pill)',
          border: 'none',
          background: saved ? 'var(--aed-success)' : 'var(--aed-pink-deep)',
          color: '#fff', fontFamily: 'inherit', fontSize: 13,
          fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1, transition: 'background var(--dur-base)',
          alignSelf: 'flex-start',
        }}
      >
        {saved ? '✓ Configurações salvas!' : saving ? 'Salvando...' : 'Salvar configurações'}
      </button>
    </form>
  );
}
