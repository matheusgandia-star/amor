'use client';
import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Order, OrderStatus, PaymentStatus, ShippingType } from '@/types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  novo: 'Novo', preparando: 'Preparando', enviado: 'Enviado', entregue: 'Entregue', cancelado: 'Cancelado',
};
const PGTO_LABELS: Record<PaymentStatus, string> = {
  aguardando: 'Aguardando', pago: 'Pago', cancelado: 'Cancelado',
};
const STATUS_COLORS: Record<OrderStatus, string> = {
  novo: 'var(--aed-warning)', preparando: '#6B8FD4', enviado: '#9B6BD4', entregue: 'var(--aed-success)', cancelado: 'var(--aed-danger)',
};
const PGTO_COLORS: Record<PaymentStatus, string> = {
  aguardando: 'var(--aed-warning)', pago: 'var(--aed-success)', cancelado: 'var(--aed-danger)',
};

const emptyOrder = () => ({
  data: new Date().toISOString().split('T')[0],
  cliente: '', whatsapp: '', endereco: '', cidade: '', cep: '',
  envio: 'correios' as ShippingType, frete: 0, pgto: '',
  status: 'novo' as OrderStatus, status_pgto: 'aguardando' as PaymentStatus,
  produtos: [], qtds: {}, subtotal: 0, total: 0,
});

export default function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyOrder());
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: OrderStatus) {
    await supabase.from('orders').update({ status }).eq('id', id);
    load();
  }

  async function updatePgto(id: string, status_pgto: PaymentStatus) {
    await supabase.from('orders').update({ status_pgto }).eq('id', id);
    load();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cliente.trim()) return;
    setSaving(true);
    const total = Number(form.subtotal) + Number(form.frete);
    const { error } = await supabase.from('orders').insert({ ...form, total });
    setSaving(false);
    if (error) { alert('Erro: ' + error.message); return; }
    setShowModal(false);
    setForm(emptyOrder());
    load();
  }

  const field = (label: string, key: keyof ReturnType<typeof emptyOrder>, type = 'text') => (
    <div>
      <label className="text-xs text-[var(--fg-3)] mb-1 block">{label}</label>
      <input
        type={type}
        value={String(form[key] ?? '')}
        onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
        className="w-full border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)]"
      />
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[var(--fg-3)]">{orders.length} pedido{orders.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--aed-pink)] text-white text-sm font-medium rounded-sm hover:bg-[var(--aed-pink-deep)] transition-colors"
        >
          <Plus size={15} /> Novo pedido
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--fg-3)]">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-md border border-[var(--aed-line)] p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-[var(--fg-1)]">{order.cliente || 'Cliente não informado'}</p>
                  <p className="text-xs text-[var(--fg-3)]">{order.data} · {order.cidade}</p>
                </div>
                <p className="font-semibold text-[var(--aed-pink-deep)]">
                  R$ {Number(order.total).toFixed(2).replace('.', ',')}
                </p>
              </div>

              <div className="flex gap-2 mt-3 flex-wrap">
                <select
                  value={order.status}
                  onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                  className="text-xs px-2 py-1 rounded-pill border-0 font-medium cursor-pointer"
                  style={{ background: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status] }}
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <select
                  value={order.status_pgto}
                  onChange={e => updatePgto(order.id, e.target.value as PaymentStatus)}
                  className="text-xs px-2 py-1 rounded-pill border-0 font-medium cursor-pointer"
                  style={{ background: PGTO_COLORS[order.status_pgto] + '22', color: PGTO_COLORS[order.status_pgto] }}
                >
                  {Object.entries(PGTO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-sm text-[var(--fg-3)]">Nenhum pedido ainda.</p>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-light">Novo pedido</h2>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">{field('Cliente *', 'cliente')}</div>
                <div>{field('WhatsApp', 'whatsapp')}</div>
                <div>{field('Data', 'data', 'date')}</div>
                <div className="col-span-2">{field('Endereço', 'endereco')}</div>
                <div>{field('Cidade', 'cidade')}</div>
                <div>{field('CEP', 'cep')}</div>

                <div>
                  <label className="text-xs text-[var(--fg-3)] mb-1 block">Envio</label>
                  <select
                    value={form.envio}
                    onChange={e => setForm(f => ({ ...f, envio: e.target.value as ShippingType }))}
                    className="w-full border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)]"
                  >
                    <option value="correios">Correios</option>
                    <option value="motoboy">Motoboy</option>
                    <option value="retirada">Retirada</option>
                  </select>
                </div>
                <div>{field('Pagamento', 'pgto')}</div>
                <div>{field('Subtotal (R$)', 'subtotal', 'number')}</div>
                <div>{field('Frete (R$)', 'frete', 'number')}</div>

                <div>
                  <label className="text-xs text-[var(--fg-3)] mb-1 block">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as OrderStatus }))}
                    className="w-full border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)]"
                  >
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--fg-3)] mb-1 block">Pagamento</label>
                  <select
                    value={form.status_pgto}
                    onChange={e => setForm(f => ({ ...f, status_pgto: e.target.value as PaymentStatus }))}
                    className="w-full border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)]"
                  >
                    {Object.entries(PGTO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-[var(--aed-line)] rounded-sm text-[var(--fg-2)]">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-[var(--aed-pink)] text-white rounded-sm hover:bg-[var(--aed-pink-deep)] disabled:opacity-60">
                  {saving ? 'Salvando...' : 'Salvar pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
