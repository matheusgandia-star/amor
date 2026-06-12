'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Check, X, Star, ChevronUp, ChevronDown, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/types';

export default function CategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [savedOrder, setSavedOrder] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('name');
    setCategories((data as Category[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const maxOrder = categories.reduce((m, c) => Math.max(m, c.sort_order ?? 0), 0);
    const { error } = await supabase.from('categories').insert({ name: newName.trim(), sort_order: maxOrder + 1, featured: false });
    if (error) { alert('Erro ao cadastrar categoria: ' + error.message); return; }
    setNewName('');
    load();
  }

  async function handleRename(id: string) {
    if (!editingName.trim()) return;
    const { error } = await supabase.from('categories').update({ name: editingName.trim() }).eq('id', id);
    if (error) { alert('Erro ao renomear: ' + error.message); return; }
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir categoria? Os produtos desta categoria ficarão sem categoria.')) return;
    await supabase.from('categories').delete().eq('id', id);
    load();
  }

  async function toggleFeatured(cat: Category) {
    const next = !cat.featured;
    await supabase.from('categories').update({ featured: next }).eq('id', cat.id);
    setCategories(cs => cs.map(c => c.id === cat.id ? { ...c, featured: next } : c));
  }

  function move(index: number, dir: -1 | 1) {
    const arr = [...categories];
    const swapIndex = index + dir;
    if (swapIndex < 0 || swapIndex >= arr.length) return;
    [arr[index], arr[swapIndex]] = [arr[swapIndex], arr[index]];
    setCategories(arr);
    setOrderChanged(true);
    setSavedOrder(false);
  }

  async function saveOrder() {
    setSavingOrder(true);
    await Promise.all(
      categories.map((cat, i) =>
        supabase.from('categories').update({ sort_order: i + 1 }).eq('id', cat.id)
      )
    );
    setSavingOrder(false);
    setOrderChanged(false);
    setSavedOrder(true);
    setTimeout(() => setSavedOrder(false), 2500);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 'var(--r-sm)',
    border: '1px solid var(--aed-line-strong)', fontFamily: 'inherit',
    fontSize: 13, color: 'var(--fg-1)', outline: 'none',
    background: 'var(--bg-surface)',
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 560 }}>

      {/* Add form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nome da categoria"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button type="submit" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '9px 18px', borderRadius: 'var(--r-pill)',
          border: 'none', background: 'var(--aed-pink-deep)', color: '#fff',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}>
          <Plus size={14} /> Adicionar
        </button>
      </form>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Carregando...</p>
      ) : categories.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--fg-3)', fontStyle: 'italic' }}>Nenhuma categoria cadastrada.</p>
      ) : (
        <div style={{
          background: 'var(--bg-surface)', borderRadius: 'var(--r-md)',
          border: '1px solid var(--aed-line)', overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '28px 1fr auto auto',
            padding: '9px 16px', borderBottom: '1px solid var(--aed-line)',
            fontSize: 11, fontWeight: 600, color: 'var(--fg-3)',
            textTransform: 'uppercase', letterSpacing: '.08em', gap: 12,
          }}>
            <span />
            <span>Categoria</span>
            <span style={{ paddingRight: 8 }}>Destaque</span>
            <span>Ações</span>
          </div>

          {categories.map((cat, i) => (
            <div key={cat.id} style={{
              display: 'grid', gridTemplateColumns: '28px 1fr auto auto',
              padding: '11px 16px', borderTop: '1px solid var(--aed-line)',
              alignItems: 'center', gap: 12,
              transition: 'background var(--dur-base)',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--aed-pink-blush)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Reorder */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} title="Mover para cima" style={{
                  width: 20, height: 16, border: 'none', background: 'transparent',
                  cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? 'var(--aed-line-strong)' : 'var(--fg-3)',
                  padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><ChevronUp size={12} /></button>
                <button onClick={() => move(i, 1)} disabled={i === categories.length - 1} title="Mover para baixo" style={{
                  width: 20, height: 16, border: 'none', background: 'transparent',
                  cursor: i === categories.length - 1 ? 'default' : 'pointer',
                  color: i === categories.length - 1 ? 'var(--aed-line-strong)' : 'var(--fg-3)',
                  padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><ChevronDown size={12} /></button>
              </div>

              {/* Name / edit */}
              {editingId === cat.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleRename(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                  style={{ ...inputStyle, padding: '5px 8px' }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--fg-1)', fontWeight: 500 }}>{cat.name}</span>
                  {cat.featured && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 7px',
                      borderRadius: 'var(--r-pill)', background: '#FFF9C9', color: '#B8920A',
                    }}>Destaque</span>
                  )}
                </div>
              )}

              {/* Featured toggle */}
              <button onClick={() => toggleFeatured(cat)} title={cat.featured ? 'Remover destaque' : 'Marcar como destaque'} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 11px', borderRadius: 'var(--r-pill)',
                border: `1px solid ${cat.featured ? '#F9E25A' : 'var(--aed-line)'}`,
                background: cat.featured ? '#FFF9C9' : 'transparent',
                color: cat.featured ? '#B8920A' : 'var(--fg-3)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all var(--dur-base)',
              }}>
                <Star size={11} fill={cat.featured ? 'currentColor' : 'none'} />
                {cat.featured ? 'Destaque' : 'Destacar'}
              </button>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                {editingId === cat.id ? (
                  <>
                    <button onClick={() => handleRename(cat.id)} title="Confirmar" style={{
                      width: 28, height: 28, borderRadius: 999, border: '1px solid var(--aed-success)',
                      background: 'transparent', cursor: 'pointer', color: 'var(--aed-success)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><Check size={13} /></button>
                    <button onClick={() => setEditingId(null)} title="Cancelar" style={{
                      width: 28, height: 28, borderRadius: 999, border: '1px solid var(--aed-line)',
                      background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><X size={13} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }} title="Renomear" style={{
                      width: 28, height: 28, borderRadius: 999, border: '1px solid var(--aed-line)',
                      background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><Pencil size={13} /></button>
                    <button onClick={() => handleDelete(cat.id)} title="Excluir" style={{
                      width: 28, height: 28, borderRadius: 999, border: '1px solid var(--aed-line)',
                      background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><Trash2 size={13} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {orderChanged && (
        <div style={{
          marginTop: 16, display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', borderRadius: 'var(--r-md)',
          background: 'var(--aed-pink-mist)', border: '1px solid var(--aed-pink-soft)',
        }}>
          <span style={{ flex: 1, fontSize: 12, color: 'var(--aed-pink-deep)', fontWeight: 500 }}>
            Ordem alterada — salve para aplicar no site.
          </span>
          <button onClick={saveOrder} disabled={savingOrder} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 18px', borderRadius: 'var(--r-pill)',
            border: 'none', background: 'var(--aed-pink-deep)', color: '#fff',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            cursor: savingOrder ? 'not-allowed' : 'pointer',
            opacity: savingOrder ? 0.7 : 1,
          }}>
            <Save size={14} />
            {savingOrder ? 'Salvando...' : 'Salvar ordem'}
          </button>
        </div>
      )}

      {savedOrder && !orderChanged && (
        <p style={{ marginTop: 14, fontSize: 12, color: 'var(--aed-success)', fontWeight: 600 }}>
          ✓ Ordem salva com sucesso!
        </p>
      )}

      <p style={{ marginTop: 14, fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.5 }}>
        Use as setas para definir a ordem de exibição das categorias no site. Categorias em <strong>Destaque</strong> aparecem em evidência.
      </p>

    </div>
  );
}
