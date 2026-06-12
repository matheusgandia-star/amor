'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/types';

interface KPI { label: string; value: string; sub: string }

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: orders } = await supabase
        .from('orders')
        .select('total, status_pgto, cliente')
        .neq('status', 'cancelado');

      const all = (orders as Pick<Order, 'total' | 'status_pgto' | 'cliente'>[]) ?? [];
      const receita = all.filter(o => o.status_pgto === 'pago').reduce((s, o) => s + o.total, 0);
      const totalPedidos = all.length;
      const ticket = totalPedidos > 0 ? receita / totalPedidos : 0;
      const clientes = new Set(all.map(o => o.cliente).filter(Boolean)).size;

      setKpis([
        { label: 'Receita confirmada', value: `R$ ${receita.toFixed(2).replace('.', ',')}`, sub: 'pedidos pagos' },
        { label: 'Total de pedidos', value: String(totalPedidos), sub: 'excl. cancelados' },
        { label: 'Ticket médio', value: `R$ ${ticket.toFixed(2).replace('.', ',')}`, sub: 'por pedido' },
        { label: 'Clientes únicos', value: String(clientes), sub: 'em pedidos' },
      ]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="text-sm text-[var(--fg-3)]">Carregando...</p>;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-md p-4 shadow-sm border border-[var(--aed-line)]">
            <p className="text-xs text-[var(--fg-3)] mb-1">{k.label}</p>
            <p className="text-2xl font-semibold text-[var(--fg-1)]">{k.value}</p>
            <p className="text-xs text-[var(--fg-3)] mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
