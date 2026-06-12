'use client';
import { useEffect, useState, useRef } from 'react';
import { Plus, Star, Trash2, Pencil, X, LayoutGrid, List, Package, AlertTriangle, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Product, Category } from '@/types';

const emptyProduct = (): Omit<Product, 'id' | 'created_at'> => ({
  name: '', sub: '', price: 0, cat: '', stock: 0,
  color: '#F9E4E6', accent: '#E88A92', photos: [],
  descricao: '', ingredientes: '', ritual: '', fav: false,
});

function StockBadge({ stock }: { stock: number }) {
  const color = stock === 0 ? 'var(--aed-danger)' : stock <= 5 ? 'var(--aed-warn)' : 'var(--aed-success)';
  const bg = stock === 0 ? '#FDECEA' : stock <= 5 ? '#FFF3E0' : '#EAF3EC';
  const label = stock === 0 ? 'Esgotado' : `${stock} un.`;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12, fontWeight: 600, padding: '3px 9px',
      borderRadius: 'var(--r-pill)', color, background: bg,
      whiteSpace: 'nowrap',
    }}>
      {stock <= 5 && stock > 0 && <AlertTriangle size={11} />}
      {label}
    </span>
  );
}

export default function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'ok' | 'low' | 'out'>('all');
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
    const payload = { ...editing, cat: editing.cat || null };
    let error;
    if (editing.id) {
      const { id, created_at, ...rest } = payload as Product;
      ({ error } = await supabase.from('products').update(rest).eq('id', id));
    } else {
      const { id, created_at, ...rest } = payload as Product;
      ({ error } = await supabase.from('products').insert(rest));
    }
    setSaving(false);
    if (error) { alert('Erro ao salvar: ' + error.message); return; }
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
    setProducts(ps => ps.map(p => p.id === id ? { ...p, fav: !fav } : p));
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

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sub?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat && p.cat !== filterCat) return false;
    if (filterStock === 'ok'  && !(p.stock > 5))   return false;
    if (filterStock === 'low' && !(p.stock > 0 && p.stock <= 5)) return false;
    if (filterStock === 'out' && p.stock !== 0)     return false;
    return true;
  });

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    borderRadius: 'var(--r-sm)', border: '1px solid var(--aed-line-strong)',
    fontFamily: 'inherit', fontSize: 13, color: 'var(--fg-1)',
    outline: 'none', background: 'var(--bg-surface)',
  };

  return (
    <div style={{ padding: 'clamp(16px,4vw,24px) clamp(16px,4vw,32px)' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {/* Row 1: search + actions */}
        <div className="aed-products-toolbar-row">
          {/* Search */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid var(--aed-line-strong)', borderRadius: 'var(--r-sm)',
            padding: '8px 12px', background: 'var(--bg-surface)',
          }}>
            <Search size={14} color="var(--fg-3)" style={{ flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar produto..."
              style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, color: 'var(--fg-1)', width: '100%' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', padding: 0, display: 'flex' }}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category filter */}
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{
            padding: '8px 12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--aed-line-strong)',
            fontFamily: 'inherit', fontSize: 13, color: filterCat ? 'var(--fg-1)' : 'var(--fg-3)',
            background: 'var(--bg-surface)', outline: 'none', cursor: 'pointer',
          }}>
            <option value="">Todas as categorias</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--aed-line)', borderRadius: 'var(--r-sm)', overflow: 'hidden', flexShrink: 0 }}>
            {(['list', 'grid'] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{
                padding: '7px 10px', border: 'none', cursor: 'pointer',
                background: viewMode === mode ? 'var(--aed-pink-mist)' : 'var(--bg-surface)',
                color: viewMode === mode ? 'var(--aed-pink-deep)' : 'var(--fg-3)',
                display: 'flex', alignItems: 'center',
              }}>
                {mode === 'list' ? <List size={15} /> : <LayoutGrid size={15} />}
              </button>
            ))}
          </div>

          <button onClick={() => setEditing(emptyProduct())} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 'var(--r-pill)',
            border: 'none', background: 'var(--aed-pink-deep)', color: '#fff',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', boxShadow: 'var(--shadow-sm)', flexShrink: 0,
          }}>
            <Plus size={15} /> Novo produto
          </button>
        </div>

        {/* Row 2: stock chips + count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {([
            { id: 'all', label: 'Todos' },
            { id: 'ok',  label: 'Em estoque' },
            { id: 'low', label: 'Estoque baixo' },
            { id: 'out', label: 'Esgotados' },
          ] as { id: typeof filterStock; label: string }[]).map(chip => (
            <button key={chip.id} onClick={() => setFilterStock(chip.id)} style={{
              padding: '5px 13px', borderRadius: 'var(--r-pill)', cursor: 'pointer',
              border: `1px solid ${filterStock === chip.id ? 'var(--aed-pink)' : 'var(--aed-line)'}`,
              background: filterStock === chip.id ? 'var(--aed-pink-mist)' : 'transparent',
              color: filterStock === chip.id ? 'var(--aed-pink-deep)' : 'var(--fg-3)',
              fontSize: 12, fontWeight: filterStock === chip.id ? 600 : 400,
              fontFamily: 'inherit',
            }}>{chip.label}</button>
          ))}
          <span style={{ fontSize: 12, color: 'var(--fg-3)', marginLeft: 4 }}>
            {filtered.length} de {products.length} produto{products.length !== 1 ? 's' : ''}
            {products.filter(p => p.stock === 0).length > 0 && (
              <span style={{ color: 'var(--aed-danger)', marginLeft: 6 }}>
                · {products.filter(p => p.stock === 0).length} esgotado{products.filter(p => p.stock === 0).length !== 1 ? 's' : ''}
              </span>
            )}
          </span>
        </div>
      </div>


      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '48px 0', fontStyle: 'italic' }}>
          {products.length === 0 ? 'Nenhum produto cadastrado.' : 'Nenhum produto encontrado com esses filtros.'}
        </p>
      ) : viewMode === 'list' ? (
        /* ---- LIST VIEW ---- */
        <div style={{
          background: 'var(--bg-surface)', borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-sm)', border: '1px solid var(--aed-line)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div className="aed-plist-header">
            <span />
            <span>Produto</span>
            <span className="aed-plist-cat">Categoria</span>
            <span>Preço</span>
            <span className="aed-plist-stock">Estoque</span>
            <span className="aed-plist-dest">Destaque</span>
            <span style={{ textAlign: 'right' }}>Ações</span>
          </div>

          {filtered.map(p => (
            <div key={p.id} className="aed-plist-row"
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--aed-pink-blush)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Thumb */}
              <div style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', overflow: 'hidden', flexShrink: 0 }}>
                {p.photos?.[0] ? (
                  <img src={p.photos[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: p.color || 'var(--aed-pink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={14} color="var(--aed-pink-deep)" />
                  </div>
                )}
              </div>

              {/* Name */}
              <div style={{ minWidth: 0, paddingRight: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                {p.sub && <div style={{ fontSize: 11, color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.sub}</div>}
              </div>

              {/* Category */}
              <span className="aed-plist-cat" style={{ fontSize: 12.5, color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {catMap[p.cat] ?? <span style={{ color: 'var(--fg-3)', fontStyle: 'italic' }}>Sem categoria</span>}
              </span>

              {/* Price */}
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--aed-pink-deep)' }}>
                R$ {Number(p.price).toFixed(2).replace('.', ',')}
              </span>

              {/* Stock */}
              <span className="aed-plist-stock"><StockBadge stock={p.stock ?? 0} /></span>

              {/* Destaque toggle */}
              <span className="aed-plist-dest"><button onClick={() => toggleFav(p.id, p.fav)} title={p.fav ? 'Remover destaque' : 'Marcar como destaque'} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 'var(--r-pill)',
                border: `1px solid ${p.fav ? '#F9E25A' : 'var(--aed-line)'}`,
                background: p.fav ? '#FFF9C9' : 'transparent',
                color: p.fav ? '#B8920A' : 'var(--fg-3)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all var(--dur-base)',
              }}>
                <Star size={12} fill={p.fav ? 'currentColor' : 'none'} />
                {p.fav ? 'Destaque' : '—'}
              </button></span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button onClick={() => setEditing(p)} title="Editar" style={{
                  width: 30, height: 30, borderRadius: 999, border: '1px solid var(--aed-line)',
                  background: 'var(--bg-surface)', cursor: 'pointer', color: 'var(--fg-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Pencil size={13} /></button>
                <button onClick={() => handleDelete(p.id)} title="Excluir" style={{
                  width: 30, height: 30, borderRadius: 999, border: '1px solid var(--aed-line)',
                  background: 'var(--bg-surface)', cursor: 'pointer', color: 'var(--fg-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ---- GRID VIEW ---- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} style={{
              background: 'var(--bg-surface)', borderRadius: 'var(--r-md)',
              border: '1px solid var(--aed-line)', overflow: 'hidden',
            }}>
              <div style={{ aspectRatio: '1/1', background: p.color || 'var(--aed-pink-soft)', position: 'relative' }}>
                {p.photos?.[0] ? (
                  <img src={p.photos[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🧼</div>
                )}
                {p.fav && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: '#FFF9C9', borderRadius: 999, padding: '3px 7px', fontSize: 10, fontWeight: 700, color: '#B8920A', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={10} fill="currentColor" /> Destaque
                  </div>
                )}
              </div>
              <div style={{ padding: '12px 14px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                <p style={{ fontSize: 11, color: 'var(--fg-3)', margin: 0 }}>{catMap[p.cat] ?? '—'}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--aed-pink-deep)' }}>R$ {Number(p.price).toFixed(2).replace('.', ',')}</span>
                  <StockBadge stock={p.stock ?? 0} />
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <button onClick={() => toggleFav(p.id, p.fav)} style={{
                    flex: 1, padding: '6px', borderRadius: 'var(--r-sm)',
                    border: `1px solid ${p.fav ? '#F9E25A' : 'var(--aed-line)'}`,
                    background: p.fav ? '#FFF9C9' : 'transparent',
                    color: p.fav ? '#B8920A' : 'var(--fg-3)',
                    cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}><Star size={11} fill={p.fav ? 'currentColor' : 'none'} />{p.fav ? 'Destaque' : 'Destacar'}</button>
                  <button onClick={() => setEditing(p)} style={{
                    flex: 1, padding: '6px', borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--aed-line)', background: 'transparent',
                    color: 'var(--fg-2)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}><Pencil size={11} /> Editar</button>
                  <button onClick={() => handleDelete(p.id)} style={{
                    width: 30, borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--aed-line)', background: 'transparent',
                    color: 'var(--fg-3)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .aed-products-toolbar-row {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .aed-plist-header {
          display: grid;
          grid-template-columns: 48px 1fr 140px 90px 100px 100px 80px;
          padding: 10px 20px;
          border-bottom: 1px solid var(--aed-line);
          font-size: 11px; font-weight: 600; color: var(--fg-3);
          text-transform: uppercase; letter-spacing: .08em;
        }
        .aed-plist-row {
          display: grid;
          grid-template-columns: 48px 1fr 140px 90px 100px 100px 80px;
          padding: 12px 20px;
          border-top: 1px solid var(--aed-line);
          align-items: center;
          transition: background var(--dur-base);
        }
        .aed-plist-row:hover { background: var(--aed-pink-blush); }
        @media (max-width: 768px) {
          .aed-products-toolbar-row { gap: 8px; }
          .aed-products-toolbar-row > select { display: none; }
          .aed-plist-header,
          .aed-plist-row {
            grid-template-columns: 40px 1fr 80px 60px;
          }
          .aed-plist-cat,
          .aed-plist-stock,
          .aed-plist-dest { display: none !important; }
          .aed-plist-header { padding: 8px 14px; }
          .aed-plist-row { padding: 10px 14px; }
        }
      `}</style>

      {/* ====== EDIT MODAL ====== */}
      {editing && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={() => setEditing(null)}>
          <div style={{
            background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)',
            width: '100%', maxWidth: 560, maxHeight: '90vh',
            overflowY: 'auto', boxShadow: 'var(--shadow-lg)',
          }} onClick={e => e.stopPropagation()}>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px 16px', borderBottom: '1px solid var(--aed-line)',
              position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 2,
            }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 20, margin: 0 }}>
                {editing.id ? 'Editar produto' : 'Novo produto'}
              </h2>
              <button onClick={() => setEditing(null)} style={{
                width: 32, height: 32, borderRadius: 999, border: '1px solid var(--aed-line)',
                background: 'transparent', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)',
              }}><X size={16} /></button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', marginBottom: 5, fontWeight: 500 }}>Nome *</label>
                  <input value={editing.name ?? ''} onChange={e => setEditing(ed => ({ ...ed, name: e.target.value }))} style={inputStyle} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', marginBottom: 5, fontWeight: 500 }}>Descrição curta</label>
                  <input value={editing.sub ?? ''} onChange={e => setEditing(ed => ({ ...ed, sub: e.target.value }))} style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', marginBottom: 5, fontWeight: 500 }}>Preço (R$)</label>
                  <input type="number" step="0.01" value={editing.price ?? 0} onChange={e => setEditing(ed => ({ ...ed, price: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', marginBottom: 5, fontWeight: 500 }}>Estoque</label>
                  <input type="number" value={editing.stock ?? 0} onChange={e => setEditing(ed => ({ ...ed, stock: parseInt(e.target.value) || 0 }))} style={inputStyle} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', marginBottom: 5, fontWeight: 500 }}>Categoria</label>
                  <select value={editing.cat ?? ''} onChange={e => setEditing(ed => ({ ...ed, cat: e.target.value }))} style={inputStyle}>
                    <option value="">Sem categoria</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {(['descricao', 'ingredientes', 'ritual'] as const).map(field => (
                  <div key={field} style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', marginBottom: 5, fontWeight: 500 }}>
                      {field === 'descricao' ? 'Descrição completa' : field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <textarea rows={2} value={(editing as any)[field] ?? ''} onChange={e => setEditing(ed => ({ ...ed, [field]: e.target.value }))}
                      style={{ ...inputStyle, resize: 'none' }} />
                  </div>
                ))}

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', marginBottom: 5, fontWeight: 500 }}>Fotos (até 4)</label>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ fontSize: 12 }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {(editing.photos ?? []).map((ph, i) => (
                      <div key={i} style={{ position: 'relative', width: 64, height: 64, borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
                        <img src={ph} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => setEditing(ed => ({ ...ed, photos: (ed?.photos ?? []).filter((_, j) => j !== i) }))}
                          style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,.5)', color: '#fff', border: 'none', cursor: 'pointer', padding: '2px 5px', fontSize: 11 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--r-sm)', background: editing.fav ? '#FFF9C9' : 'var(--aed-pink-mist)', border: `1px solid ${editing.fav ? '#F9E25A' : 'var(--aed-line)'}` }}>
                  <input type="checkbox" id="fav-edit" checked={editing.fav ?? false} onChange={e => setEditing(ed => ({ ...ed, fav: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#B8920A' }} />
                  <label htmlFor="fav-edit" style={{ fontSize: 13, color: 'var(--fg-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Star size={14} fill={editing.fav ? '#B8920A' : 'none'} color={editing.fav ? '#B8920A' : 'var(--fg-3)'} />
                    Produto em destaque <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>(aparece na seção Nossos Favoritos)</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                <button onClick={() => setEditing(null)} style={{
                  padding: '10px 20px', borderRadius: 'var(--r-pill)',
                  border: '1px solid var(--aed-line)', background: 'transparent',
                  fontFamily: 'inherit', fontSize: 13, color: 'var(--fg-2)', cursor: 'pointer',
                }}>Cancelar</button>
                <button onClick={handleSave} disabled={saving} style={{
                  padding: '10px 24px', borderRadius: 'var(--r-pill)',
                  border: 'none', background: 'var(--aed-pink-deep)', color: '#fff',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                }}>
                  {saving ? 'Salvando...' : 'Salvar produto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
