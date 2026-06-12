'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, Receipt, Heart, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Order, Product } from '@/types';

/* ---- micro chart components ---- */

function Sparkline({ data }: { data: number[] }) {
  const w = 560, h = 160, pad = 8;
  if (data.length < 2) return null;
  const max = Math.max(...data, 1), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
    return [x, y];
  });
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pts[0][0].toFixed(1)},${h - pad} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--aed-pink)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--aed-pink)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#salesFill)" />
      <path d={line} fill="none" stroke="var(--aed-pink)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill="#fff" stroke="var(--aed-pink-deep)" strokeWidth="2.5" />
    </svg>
  );
}

function MiniBars({ data }: { data: { d: string; v: number }[] }) {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 110, padding: '0 2px' }}>
      {data.map(d => (
        <div key={d.d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: 84 }}>
            <div style={{
              width: '100%',
              height: `${Math.max((d.v / max) * 100, 4)}%`,
              background: d.d === 'Sáb' ? 'var(--aed-pink)' : 'var(--aed-pink-soft)',
              borderRadius: '6px 6px 0 0',
              transition: 'height var(--dur-slow) var(--ease-soft)',
            }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{d.d}</span>
        </div>
      ))}
    </div>
  );
}

/* ---- KPI card ---- */

interface KpiDef {
  label: string;
  value: string;
  sub: string;
  Icon: React.ElementType;
  tint: string;
  up: boolean;
  delta: string;
}

function KpiCard({ k }: { k: KpiDef }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', borderRadius: 'var(--r-md)',
      boxShadow: 'var(--shadow-sm)', padding: 20,
      display: 'flex', flexDirection: 'column', gap: 14,
      border: '1px solid var(--aed-line)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          width: 40, height: 40, borderRadius: 'var(--r-sm)',
          background: k.tint,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--aed-ink)',
        }}>
          <k.Icon size={19} strokeWidth={1.7} />
        </span>
        {k.delta && (
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: k.up ? 'var(--aed-success)' : 'var(--aed-danger)',
            display: 'inline-flex', alignItems: 'center', gap: 3,
          }}>
            {k.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {k.delta}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--fg-1)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
          {k.value}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 6 }}>{k.label}</div>
      </div>
    </div>
  );
}

/* ---- Status pill ---- */

const STATUS_MAP: Record<string, { label: string; tone: string; bg: string }> = {
  pendente:   { label: 'Pendente',   tone: '#E8A961', bg: '#FFF3E0' },
  preparando: { label: 'Preparando', tone: '#6FB8D8', bg: '#E8F4FA' },
  enviado:    { label: 'Enviado',    tone: '#7FB28A', bg: '#EAF3EC' },
  entregue:   { label: 'Entregue',   tone: '#7FB28A', bg: '#EAF3EC' },
  cancelado:  { label: 'Cancelado',  tone: '#D97068', bg: '#FDECEA' },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, tone: 'var(--fg-3)', bg: 'var(--aed-line)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12, fontWeight: 600, padding: '4px 11px',
      borderRadius: 'var(--r-pill)', color: s.tone, background: s.bg,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.tone }} />
      {s.label}
    </span>
  );
}

/* ---- Avatar ---- */

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const hue = (name.charCodeAt(0) * 37) % 360;
  return (
    <span style={{
      width: size, height: size, borderRadius: 999, flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue} 60% 88%), hsl(${(hue + 40) % 360} 55% 80%))`,
      color: 'var(--aed-ink)', fontWeight: 600, fontSize: size * 0.35,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>{initials}</span>
  );
}

/* ---- Dashboard ---- */

const WEEKDAYS = [
  { d: 'Seg', v: 0 }, { d: 'Ter', v: 0 }, { d: 'Qua', v: 0 },
  { d: 'Qui', v: 0 }, { d: 'Sex', v: 0 }, { d: 'Sáb', v: 0 }, { d: 'Dom', v: 0 },
];

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const [{ data: o }, { data: p }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
      ]);
      setOrders((o as Order[]) ?? []);
      setProducts((p as Product[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '48px 36px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: 96, borderRadius: 'var(--r-md)', background: 'var(--aed-line)', opacity: 0.4 }} />
        ))}
      </div>
    );
  }

  const active = orders.filter(o => o.status !== 'cancelado');
  const receita = active.filter(o => o.status_pgto === 'pago').reduce((s, o) => s + (o.total ?? 0), 0);
  const totalPedidos = active.length;
  const ticket = totalPedidos > 0 ? receita / totalPedidos : 0;
  const clientes = new Set(active.map(o => o.cliente).filter(Boolean)).size;

  const kpis: KpiDef[] = [
    { label: 'Receita confirmada', value: `R$ ${receita.toFixed(0)}`, sub: 'pedidos pagos', Icon: TrendingUp, tint: 'var(--aed-pink-mist)', up: true, delta: '' },
    { label: 'Total de pedidos',   value: String(totalPedidos),        sub: 'excl. cancelados', Icon: ShoppingBag, tint: '#EAF0E4', up: true, delta: '' },
    { label: 'Ticket médio',       value: `R$ ${ticket.toFixed(0)}`,   sub: 'por pedido',    Icon: Receipt, tint: '#FCF0DF', up: true, delta: '' },
    { label: 'Clientes únicos',    value: String(clientes),            sub: 'em pedidos',    Icon: Heart,   tint: '#E5F1F8', up: true, delta: '' },
  ];

  // Build sparkline from last 14 orders (dummy daily buckets by index)
  const sparkData = (() => {
    const buckets = Array(14).fill(0);
    active.slice(0, 14).forEach((o, i) => { buckets[13 - i] += o.total ?? 0; });
    return buckets;
  })();

  // Low stock
  const lowStock = products.filter(p => (p.stock ?? 0) <= 7);

  // Recent orders
  const recent = orders.slice(0, 5);

  return (
    <div style={{ padding: 'clamp(16px,4vw,28px) clamp(16px,4vw,36px) 60px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* KPIs */}
      <div className="aed-dash-kpi-grid">
        {kpis.map(k => <KpiCard key={k.label} k={k} />)}
      </div>

      {/* Chart row */}
      <div className="aed-dash-row">
        <div style={{
          background: 'var(--bg-surface)', borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-sm)', padding: 24,
          border: '1px solid var(--aed-line)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16, color: 'var(--fg-1)', margin: '0 0 4px' }}>
                Vendas — últimos 14 pedidos
              </h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 28, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--fg-1)' }}>
                  R$ {receita.toFixed(0)}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: totalPedidos > 0 ? 'var(--aed-success)' : 'var(--fg-3)' }}>
                  {totalPedidos > 0 ? `${totalPedidos} pedido${totalPedidos !== 1 ? 's' : ''}` : 'Nenhuma venda ainda'}
                </span>
              </div>
            </div>
          </div>
          {sparkData.some(v => v > 0) ? (
            <Sparkline data={sparkData} />
          ) : (
            <div style={{
              height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--fg-3)', fontSize: 13, fontStyle: 'italic',
              background: 'var(--aed-pink-mist)', borderRadius: 'var(--r-md)',
            }}>
              Os dados de vendas aparecerão aqui 🩷
            </div>
          )}
        </div>

        <div style={{
          background: 'var(--bg-surface)', borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-sm)', padding: 24,
          border: '1px solid var(--aed-line)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16, color: 'var(--fg-1)', margin: '0 0 16px' }}>
            Pedidos por dia
          </h2>
          <MiniBars data={WEEKDAYS} />
          <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 12, textAlign: 'center' }}>
            Seus pedidos aparecerão aqui 🩷
          </div>
        </div>
      </div>

      {/* Recent orders + side */}
      <div className="aed-dash-row">
        <div style={{
          background: 'var(--bg-surface)', borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
          border: '1px solid var(--aed-line)',
        }}>
          <div style={{ padding: '20px 24px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16, color: 'var(--fg-1)', margin: 0 }}>
              Pedidos recentes
            </h2>
          </div>
          {recent.length === 0 ? (
            <div style={{ padding: '24px', fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', fontStyle: 'italic' }}>
              Nenhum pedido ainda
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <tbody>
                {recent.map(o => (
                  <tr key={o.id} style={{ borderTop: '1px solid var(--aed-line)', cursor: 'default' }}>
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar name={o.cliente ?? '?'} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--fg-1)' }}>{o.cliente}</div>
                          <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>#{String(o.id).slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <StatusPill status={o.status ?? 'pendente'} />
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'right', fontWeight: 600, color: 'var(--fg-1)' }}>
                      R$ {(o.total ?? 0).toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low stock */}
        <div style={{
          background: 'var(--aed-pink-mist)', borderRadius: 'var(--r-md)',
          padding: 24, border: '1px solid var(--aed-pink-soft)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertCircle size={18} color="var(--aed-pink-deep)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16, color: 'var(--fg-1)', margin: 0 }}>
              Estoque baixo
            </h2>
          </div>
          {lowStock.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--aed-success)', fontStyle: 'italic', margin: 0 }}>
              🌿 Estoque em dia!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {lowStock.slice(0, 5).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 'var(--r-sm)', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--aed-pink-soft), var(--aed-cream))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                  }}>🧼</div>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--fg-1)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: (p.stock ?? 0) === 0 ? 'var(--aed-danger)' : 'var(--aed-warn)',
                  }}>
                    {(p.stock ?? 0) === 0 ? 'Esgotado' : `${p.stock} un.`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .aed-dash-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        .aed-dash-row {
          display: grid;
          grid-template-columns: 1.7fr 1fr;
          gap: 18px;
        }
        @media (max-width: 768px) {
          .aed-dash-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .aed-dash-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
