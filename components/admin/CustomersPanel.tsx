'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, ChevronDown, ChevronUp, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Customer } from '@/types';

const empty: Omit<Customer, 'id' | 'created_at'> = { nome: '', whatsapp: '', endereco: '', cidade: '', cep: '' };

export default function CustomersPanel() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from('customers').select('*').order('nome');
    setCustomers((data as Customer[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditingId(null);
    setForm(empty);
    setShowForm(true);
  }

  function openEdit(c: Customer) {
    setEditingId(c.id);
    setForm({ nome: c.nome, whatsapp: c.whatsapp, endereco: c.endereco, cidade: c.cidade, cep: c.cep });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(empty);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    if (editingId) {
      await supabase.from('customers').update(form).eq('id', editingId);
    } else {
      await supabase.from('customers').insert(form);
    }
    closeForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir cliente?')) return;
    await supabase.from('customers').delete().eq('id', id);
    load();
  }

  const fields: [keyof typeof empty, string][] = [
    ['nome', 'Nome *'], ['whatsapp', 'WhatsApp'], ['endereco', 'Endereço'], ['cidade', 'Cidade'], ['cep', 'CEP'],
  ];

  return (
    <div className="max-w-2xl">
      <button
        onClick={showForm && !editingId ? closeForm : openNew}
        className="flex items-center gap-2 mb-4 px-4 py-2 bg-[var(--aed-pink)] text-white text-sm font-medium rounded-sm hover:bg-[var(--aed-pink-deep)] transition-colors"
      >
        <Plus size={15} />
        Novo cliente
        {showForm && !editingId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-md p-4 border border-[var(--aed-line)] mb-6 grid grid-cols-2 gap-3">
          <div className="col-span-2 flex justify-between items-center">
            <p className="text-sm font-medium text-[var(--fg-1)]">{editingId ? 'Editar cliente' : 'Novo cliente'}</p>
            <button type="button" onClick={closeForm}><X size={16} className="text-[var(--fg-3)]" /></button>
          </div>
          {fields.map(([k, label]) => (
            <div key={k} className={k === 'nome' || k === 'endereco' ? 'col-span-2' : ''}>
              <label className="text-xs text-[var(--fg-3)] mb-1 block">{label}</label>
              <input
                value={form[k]}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="w-full border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)]"
              />
            </div>
          ))}
          <div className="col-span-2 flex gap-2 justify-end mt-2">
            <button type="button" onClick={closeForm} className="px-4 py-2 text-sm text-[var(--fg-2)] border border-[var(--aed-line)] rounded-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm bg-[var(--aed-pink)] text-white rounded-sm hover:bg-[var(--aed-pink-deep)]">Salvar</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-[var(--fg-3)]">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {customers.map(c => (
            <div key={c.id} className="flex items-start justify-between bg-white rounded-md px-4 py-3 border border-[var(--aed-line)]">
              <div>
                <p className="text-sm font-medium text-[var(--fg-1)]">{c.nome}</p>
                {c.whatsapp && <p className="text-xs text-[var(--fg-3)]">📱 {c.whatsapp}</p>}
                {c.cidade && <p className="text-xs text-[var(--fg-3)]">{c.cidade}</p>}
              </div>
              <div className="flex gap-2 mt-0.5">
                <button onClick={() => openEdit(c)} className="text-[var(--fg-3)] hover:text-[var(--aed-pink)] transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(c.id)} className="text-[var(--fg-3)] hover:text-[var(--aed-danger)] transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          {customers.length === 0 && <p className="text-sm text-[var(--fg-3)]">Nenhum cliente cadastrado.</p>}
        </div>
      )}
    </div>
  );
}
