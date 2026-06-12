'use client';
import { useEffect, useState, useRef } from 'react';
import { Plus, Star, Trash2, Pencil, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Product, Category } from '@/types';

const emptyProduct = (): Omit<Product, 'id' | 'created_at'> => ({
  name: '', sub: '', price: 0, cat: '', stock: 0,
  color: '#F9E4E6', accent: '#E88A92', photos: [],
  descricao: '', ingredientes: '', ritual: '', fav: false,
});

export default function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function load() {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts((prods as Product[]) ?? []);
    setCategories((cats as Category[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!editing || !editing.name?.trim()) return;
    setSaving(true);
    if (editing.id) {
      const { id, created_at, ...rest } = editing as Product;
      await supabase.from('products').update(rest).eq('id', id);
    } else {
      await supabase.from('products').insert(editing);
    }
    setSaving(false);
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir produto?')) return;
    await supabase.from('products').delete().eq('id', id);
    load();
  }

  async function toggleFav(id: string, fav: boolean) {
    await supabase.from('products').update({ fav: !fav }).eq('id', id);
    load();
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const current = editing?.photos ?? [];
    if (current.length >= 4) return;

    const newPhotos: string[] = await Promise.all(
      files.slice(0, 4 - current.length).map(file => new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = ev => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX = 720;
            const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
            res(canvas.toDataURL('image/jpeg', 0.72));
          };
          img.src = ev.target!.result as string;
        };
        reader.readAsDataURL(file);
      }))
    );

    setEditing(ed => ({ ...ed, photos: [...current, ...newPhotos] }));
    e.target.value = '';
  }

  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  return (
    <div>
      <button
        onClick={() => setEditing(emptyProduct())}
        className="flex items-center gap-2 mb-4 px-4 py-2 bg-[var(--aed-pink)] text-white text-sm font-medium rounded-sm hover:bg-[var(--aed-pink-deep)] transition-colors"
      >
        <Plus size={15} /> Novo produto
      </button>

      {loading ? (
        <p className="text-sm text-[var(--fg-3)]">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-md border border-[var(--aed-line)] overflow-hidden">
              <div className="aspect-square bg-[var(--bg-surface-2)] relative" style={{ borderTop: `3px solid ${p.color}` }}>
                {p.photos?.[0] ? (
                  <img src={p.photos[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: p.color }}>🧼</div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-[var(--fg-1)] truncate">{p.name}</p>
                <p className="text-xs text-[var(--fg-3)]">{catMap[p.cat] ?? '—'} · Estoque: {p.stock}</p>
                <p className="text-sm font-semibold text-[var(--aed-pink-deep)] mt-1">R$ {Number(p.price).toFixed(2).replace('.', ',')}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => toggleFav(p.id, p.fav)} className={p.fav ? 'text-yellow-400' : 'text-[var(--fg-3)]'}><Star size={15} fill={p.fav ? 'currentColor' : 'none'} /></button>
                  <button onClick={() => setEditing(p)} className="text-[var(--fg-3)] hover:text-[var(--aed-pink)]"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-[var(--fg-3)] hover:text-[var(--aed-danger)]"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-light">{editing.id ? 'Editar produto' : 'Novo produto'}</h2>
              <button onClick={() => setEditing(null)}><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-[var(--fg-3)] mb-1 block">Nome *</label>
                <input value={editing.name ?? ''} onChange={e => setEditing(ed => ({ ...ed, name: e.target.value }))}
                  className="w-full border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)]" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[var(--fg-3)] mb-1 block">Descrição curta</label>
                <input value={editing.sub ?? ''} onChange={e => setEditing(ed => ({ ...ed, sub: e.target.value }))}
                  className="w-full border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--fg-3)] mb-1 block">Preço (R$)</label>
                <input type="number" step="0.01" value={editing.price ?? 0} onChange={e => setEditing(ed => ({ ...ed, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--fg-3)] mb-1 block">Estoque</label>
                <input type="number" value={editing.stock ?? 0} onChange={e => setEditing(ed => ({ ...ed, stock: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)]" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[var(--fg-3)] mb-1 block">Categoria</label>
                <select value={editing.cat ?? ''} onChange={e => setEditing(ed => ({ ...ed, cat: e.target.value }))}
                  className="w-full border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)]">
                  <option value="">Sem categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {(['descricao', 'ingredientes', 'ritual'] as const).map(field => (
                <div key={field} className="col-span-2">
                  <label className="text-xs text-[var(--fg-3)] mb-1 block capitalize">{field === 'descricao' ? 'Descrição completa' : field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <textarea rows={2} value={(editing as any)[field] ?? ''} onChange={e => setEditing(ed => ({ ...ed, [field]: e.target.value }))}
                    className="w-full border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)] resize-none" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-xs text-[var(--fg-3)] mb-1 block">Fotos (até 4)</label>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="text-xs" />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {(editing.photos ?? []).map((ph, i) => (
                    <div key={i} className="relative w-16 h-16 rounded overflow-hidden">
                      <img src={ph} className="w-full h-full object-cover" />
                      <button
                        className="absolute top-0 right-0 bg-black/50 text-white rounded-bl px-1 text-xs"
                        onClick={() => setEditing(ed => ({ ...ed, photos: (ed?.photos ?? []).filter((_, j) => j !== i) }))}
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="fav" checked={editing.fav ?? false} onChange={e => setEditing(ed => ({ ...ed, fav: e.target.checked }))} />
                <label htmlFor="fav" className="text-sm text-[var(--fg-2)]">⭐ Produto favorito (aparece em destaque no site)</label>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border border-[var(--aed-line)] rounded-sm text-[var(--fg-2)]">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-[var(--aed-pink)] text-white rounded-sm hover:bg-[var(--aed-pink-deep)] disabled:opacity-60">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
