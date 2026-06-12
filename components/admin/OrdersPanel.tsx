'use client';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Order, OrderStatus, PaymentStatus } from '@/types';

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

export default function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[var(--fg-3)]">{orders.length} pedido{orders.length !== 1 ? 's' : ''}</p>
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
    </div>
  );
}
