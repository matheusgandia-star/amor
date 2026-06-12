'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/types';

export default function CategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories((data as Category[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await supabase.from('categories').insert({ name: newName.trim() });
    setNewName('');
    load();
  }

  async function handleRename(id: string) {
    if (!editingName.trim()) return;
    await supabase.from('categories').update({ name: editingName.trim() }).eq('id', id);
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir categoria? Os produtos desta categoria ficarão sem categoria.')) return;
    await supabase.from('categories').delete().eq('id', id);
    load();
  }

  return (
    <div className="max-w-lg">
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nome da categoria"
          className="flex-1 border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)]"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--aed-pink)] text-white text-sm font-medium rounded-sm hover:bg-[var(--aed-pink-deep)] transition-colors"
        >
          <Plus size={15} /> Adicionar
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-[var(--fg-3)]">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between bg-white rounded-md px-4 py-3 border border-[var(--aed-line)] gap-2">
              {editingId === cat.id ? (
                <>
                  <input
                    autoFocus
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                    className="flex-1 border border-[var(--aed-pink)] rounded-sm px-2 py-1 text-sm focus:outline-none"
                  />
                  <button onClick={() => handleRename(cat.id)} className="text-[var(--aed-success)] hover:opacity-70">
                    <Check size={15} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-[var(--fg-3)] hover:opacity-70">
                    <X size={15} />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-sm text-[var(--fg-1)] flex-1">{cat.name}</span>
                  <button
                    onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                    className="text-[var(--fg-3)] hover:text-[var(--aed-pink)] transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-[var(--fg-3)] hover:text-[var(--aed-danger)] transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-[var(--fg-3)]">Nenhuma categoria cadastrada.</p>
          )}
        </div>
      )}
    </div>
  );
}
