'use client';
import { useEffect, useState } from 'react';
import { Plus, X, ChevronRight, MapPin, Phone, Package, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Order, OrderStatus, PaymentStatus, ShippingType, Customer } from '@/types';

/* ---- constants ---- */

const STATUS_STEPS: OrderStatus[] = ['novo', 'preparando', 'enviado', 'entregue'];

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; dot: string }> = {
  novo:       { label: 'Novo',       color: '#E8A961', bg: '#FFF3E0', dot: '#E8A961' },
  preparando: { label: 'Preparando', color: '#6B8FD4', bg: '#EEF2FB', dot: '#6B8FD4' },
  enviado:    { label: 'Enviado',    color: '#9B6BD4', bg: '#F3EDFB', dot: '#9B6BD4' },
  entregue:   { label: 'Entregue',   color: '#7FB28A', bg: '#EAF3EC', dot: '#7FB28A' },
  cancelado:  { label: 'Cancelado',  color: '#D97068', bg: '#FDECEA', dot: '#D97068' },
};

const PGTO_META: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  aguardando: { label: 'Aguardando pagamento', color: '#E8A961', bg: '#FFF3E0' },
  pago:       { label: 'Pago',                color: '#7FB28A', bg: '#EAF3EC' },
  cancelado:  { label: 'Cancelado',           color: '#D97068', bg: '#FDECEA' },
};

const SHIP_LABELS: Record<ShippingType, string> = {
  correios: 'Correios', motoboy: 'Motoboy', retirada: 'Retirada',
};

const FILTER_TABS: { id: OrderStatus | 'todos'; label: string }[] = [
  { id: 'todos',      label: 'Todos' },
  { id: 'novo',       label: 'Novos' },
  { id: 'preparando', label: 'Preparando' },
  { id: 'enviado',    label: 'Enviados' },
  { id: 'entregue',   label: 'Entregues' },
  { id: 'cancelado',  label: 'Cancelados' },
];

/* ---- helpers ---- */

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '?';
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const hue = (name.charCodeAt(0) * 37) % 360;
  return (
    <span style={{
      width: size, height: size, borderRadius: 999, flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue} 60% 88%), hsl(${(hue + 40) % 360} 55% 80%))`,
      color: 'var(--aed-ink)', fontWeight: 600, fontSize: size * 0.36,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>{initials(name)}</span>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const m = STATUS_META[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12, fontWeight: 600, padding: '4px 10px',
      borderRadius: 'var(--r-pill)', color: m.color, background: m.bg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: m.dot }} />
      {m.label}
    </span>
  );
}

function PgtoPill({ status }: { status: PaymentStatus }) {
  const m = PGTO_META[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12, fontWeight: 600, padding: '4px 10px',
      borderRadius: 'var(--r-pill)', color: m.color, background: m.bg,
    }}>
      {m.label}
    </span>
  );
}

/* ---- order number from id ---- */
function orderNum(id: string) {
  return '#' + id.replace(/-/g, '').slice(0, 6).toUpperCase();
}

/* ---- format date ---- */
function fmtDate(d: string) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  } catch { return d; }
}

/* ---- empty order form ---- */
const emptyForm = () => ({
  data: new Date().toISOString().split('T')[0],
  cliente: '', whatsapp: '', endereco: '', cidade: '', cep: '',
  envio: 'correios' as ShippingType, frete: 0, pgto: '',
  status: 'novo' as OrderStatus, status_pgto: 'aguardando' as PaymentStatus,
  produtos: [] as string[], qtds: {} as Record<string, number>, subtotal: 0, total: 0,
  obs: '',
});

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export default function OrdersPanel() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<OrderStatus | 'todos'>('todos');
  const [selected, setSelected]     = useState<Order | null>(null);
  const [showNew, setShowNew]       = useState(false);
  const [editMode, setEditMode]     = useState(false);
  const [form, setForm]             = useState(emptyForm());
  const [saving, setSaving]         = useState(false);
  const [custSearch, setCustSearch] = useState('');
  const supabase = createClient();

  async function load() {
    const [{ data: o }, { data: c }] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('customers').select('*').order('nome'),
    ]);
    setOrders((o as Order[]) ?? []);
    setCustomers((c as Customer[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  /* ---- filtered list ---- */
  const filtered = filter === 'todos' ? orders : orders.filter(o => o.status === filter);

  /* ---- new / edit save ---- */
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cliente.trim()) return;
    setSaving(true);
    const total = Number(form.subtotal) + Number(form.frete);
    let error: { message: string } | null = null;
    if (editMode && selected) {
      const { id, created_at, ...rest } = { ...form, total, id: selected.id, created_at: selected.created_at };
      ({ error } = await supabase.from('orders').update(rest).eq('id', selected.id));
    } else {
      ({ error } = await supabase.from('orders').insert({ ...form, total }));
    }
    setSaving(false);
    if (error) { alert('Erro: ' + error.message); return; }
    setShowNew(false);
    setEditMode(false);
    setForm(emptyForm());
    await load();
    if (editMode && selected) {
      const fresh = await supabase.from('orders').select('*').eq('id', selected.id).single();
      if (fresh.data) setSelected(fresh.data as Order);
    }
  }

  /* ---- advance status ---- */
  async function advanceStatus(order: Order) {
    const idx = STATUS_STEPS.indexOf(order.status);
    if (idx < 0 || idx >= STATUS_STEPS.length - 1) return;
    const next = STATUS_STEPS[idx + 1];
    await supabase.from('orders').update({ status: next }).eq('id', order.id);
    setSelected({ ...order, status: next });
    load();
  }

  /* ---- set payment status ---- */
  async function setPgto(order: Order, status_pgto: PaymentStatus) {
    await supabase.from('orders').update({ status_pgto }).eq('id', order.id);
    setSelected({ ...order, status_pgto });
    load();
  }

  /* ---- open edit form ---- */
  function openEdit(order: Order) {
    setForm({
      data: order.data ?? '',
      cliente: order.cliente ?? '',
      whatsapp: order.whatsapp ?? '',
      endereco: order.endereco ?? '',
      cidade: order.cidade ?? '',
      cep: order.cep ?? '',
      envio: order.envio ?? 'correios',
      frete: order.frete ?? 0,
      pgto: order.pgto ?? '',
      status: order.status ?? 'novo',
      status_pgto: order.status_pgto ?? 'aguardando',
      produtos: order.produtos ?? [],
      qtds: order.qtds ?? {},
      subtotal: order.subtotal ?? 0,
      total: order.total ?? 0,
      obs: (order as any).obs ?? '',
    });
    setEditMode(true);
    setShowNew(true);
  }

  /* ---- select customer ---- */
  function selectCustomer(c: Customer) {
    setForm(f => ({
      ...f,
      cliente: c.nome,
      whatsapp: c.whatsapp ?? '',
      endereco: c.endereco ?? '',
      cidade: c.cidade ?? '',
      cep: c.cep ?? '',
    }));
    setCustSearch('');
  }

  const custFiltered = custSearch.length >= 1
    ? customers.filter(c => c.nome.toLowerCase().includes(custSearch.toLowerCase()))
    : [];

  /* ---- input helper ---- */
  function Field({ label, k, type = 'text', span }: { label: string; k: keyof ReturnType<typeof emptyForm>; type?: string; span?: boolean }) {
    return (
      <div style={span ? { gridColumn: '1 / -1' } : {}}>
        <label style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', marginBottom: 5, fontWeight: 500 }}>{label}</label>
        <input
          type={type}
          value={String(form[k] ?? '')}
          onChange={e => setForm(f => ({ ...f, [k]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
          style={{
            width: '100%', padding: '9px 12px',
            borderRadius: 'var(--r-sm)', border: '1px solid var(--aed-line-strong)',
            fontFamily: 'inherit', fontSize: 13, color: 'var(--fg-1)', outline: 'none',
            background: 'var(--bg-surface)',
          }}
        />
      </div>
    );
  }

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div style={{ padding: '24px 32px', minHeight: '100%' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTER_TABS.map(tab => {
            const count = tab.id === 'todos' ? orders.length : orders.filter(o => o.status === tab.id).length;
            const active = filter === tab.id;
            return (
              <button key={tab.id} onClick={() => setFilter(tab.id)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 'var(--r-pill)',
                border: `1px solid ${active ? 'var(--aed-pink)' : 'var(--aed-line)'}`,
                background: active ? 'var(--aed-pink-mist)' : 'var(--bg-surface)',
                color: active ? 'var(--aed-pink-deep)' : 'var(--fg-2)',
                fontSize: 13, fontWeight: active ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all var(--dur-base) var(--ease-soft)',
              }}>
                {tab.label}
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 999, display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
                  background: active ? 'var(--aed-pink)' : 'var(--aed-line)',
                  color: active ? '#fff' : 'var(--fg-3)', padding: '0 4px',
                }}>{count}</span>
              </button>
            );
          })}
        </div>
        <button onClick={() => { setEditMode(false); setForm(emptyForm()); setShowNew(true); }} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 18px', borderRadius: 'var(--r-pill)',
          border: 'none', background: 'var(--aed-pink-deep)', color: '#fff',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
        }}>
          <Plus size={15} /> Novo pedido
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '48px 0', fontStyle: 'italic' }}>
          Nenhum pedido {filter !== 'todos' ? 'nesta categoria' : 'ainda'}.
        </p>
      ) : (
        <div style={{
          background: 'var(--bg-surface)', borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-sm)', border: '1px solid var(--aed-line)',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '120px 1fr 110px 130px 120px 120px 90px',
            padding: '10px 24px',
            borderBottom: '1px solid var(--aed-line)',
            fontSize: 11, fontWeight: 600, color: 'var(--fg-3)',
            textTransform: 'uppercase', letterSpacing: '.08em',
          }}>
            <span>Pedido</span>
            <span>Cliente</span>
            <span>Data</span>
            <span>Pagamento</span>
            <span>Pgto. status</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Total</span>
          </div>

          {/* Rows */}
          {filtered.map(order => (
            <div key={order.id}
              onClick={() => setSelected(order)}
              style={{
                display: 'grid', gridTemplateColumns: '120px 1fr 110px 130px 120px 120px 90px',
                padding: '14px 24px', cursor: 'pointer',
                borderTop: '1px solid var(--aed-line)',
                alignItems: 'center',
                transition: 'background var(--dur-base)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--aed-pink-blush)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--aed-pink-deep)' }}>
                {orderNum(order.id)}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={order.cliente ?? '?'} size={32} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{order.cliente || '—'}</div>
                  {order.cidade && <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{order.cidade}</div>}
                </div>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{fmtDate(order.data)}</span>
              <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{order.pgto || '—'}</span>
              <PgtoPill status={order.status_pgto ?? 'aguardando'} />
              <StatusPill status={order.status ?? 'novo'} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', textAlign: 'right' }}>
                R$ {Number(order.total).toFixed(2).replace('.', ',')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ====== ORDER DETAIL DRAWER ====== */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,.35)',
          display: 'flex', justifyContent: 'flex-end',
        }} onClick={() => setSelected(null)}>
          <div style={{
            width: 480, height: '100%', background: 'var(--bg-surface)',
            display: 'flex', flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)',
            overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>

            {/* Drawer header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px 16px',
              borderBottom: '1px solid var(--aed-line)',
              position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 2,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 20, margin: 0, color: 'var(--fg-1)' }}>
                  Pedido {orderNum(selected.id)}
                </h2>
                <StatusPill status={selected.status ?? 'novo'} />
              </div>
              <button onClick={() => setSelected(null)} style={{
                width: 32, height: 32, borderRadius: 999, border: '1px solid var(--aed-line)',
                background: 'transparent', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)',
              }}><X size={16} /></button>
            </div>

            {/* Payment status quick actions */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--aed-line)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['aguardando', 'pago', 'cancelado'] as PaymentStatus[]).map(s => {
                const m = PGTO_META[s];
                const active = selected.status_pgto === s;
                return (
                  <button key={s} onClick={() => setPgto(selected, s)} style={{
                    padding: '7px 14px', borderRadius: 'var(--r-pill)',
                    border: `1.5px solid ${active ? m.color : 'var(--aed-line)'}`,
                    background: active ? m.bg : 'transparent',
                    color: active ? m.color : 'var(--fg-3)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all var(--dur-base)',
                  }}>
                    {active && '✓ '}{m.label}
                  </button>
                );
              })}
            </div>

            {/* Meta line */}
            <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--aed-line)', fontSize: 12.5, color: 'var(--fg-3)', display: 'flex', gap: 16 }}>
              <span>📅 {fmtDate(selected.data)}</span>
              {selected.pgto && <span>💳 {selected.pgto}</span>}
              <span>🚚 {SHIP_LABELS[selected.envio ?? 'correios']}</span>
            </div>

            {/* Stepper */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--aed-line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {STATUS_STEPS.map((step, idx) => {
                  const stepIdx = STATUS_STEPS.indexOf(selected.status ?? 'novo');
                  const done = idx <= stepIdx && selected.status !== 'cancelado';
                  const current = idx === stepIdx && selected.status !== 'cancelado';
                  return (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', flex: idx < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 999,
                          border: `2px solid ${done ? 'var(--aed-pink)' : 'var(--aed-line)'}`,
                          background: done ? 'var(--aed-pink)' : 'var(--bg-surface)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all var(--dur-base)',
                        }}>
                          {done
                            ? <CheckCircle2 size={14} color="#fff" strokeWidth={2.5} />
                            : <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--aed-line)' }} />
                          }
                        </div>
                        <span style={{
                          fontSize: 10.5, fontWeight: current ? 600 : 400,
                          color: current ? 'var(--aed-pink-deep)' : done ? 'var(--fg-2)' : 'var(--fg-3)',
                          whiteSpace: 'nowrap',
                        }}>{STATUS_META[step].label}</span>
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div style={{
                          flex: 1, height: 2, marginBottom: 22,
                          background: idx < stepIdx && selected.status !== 'cancelado' ? 'var(--aed-pink)' : 'var(--aed-line)',
                          transition: 'background var(--dur-base)',
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Client */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--aed-line)' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--fg-3)', fontWeight: 600, marginBottom: 12 }}>
                Cliente
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <Avatar name={selected.cliente ?? '?'} size={44} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--fg-1)' }}>{selected.cliente}</div>
                  {selected.whatsapp && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--fg-2)' }}>
                      <Phone size={13} /> {selected.whatsapp}
                    </div>
                  )}
                  {(selected.endereco || selected.cidade) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--fg-2)' }}>
                      <MapPin size={13} />
                      {[selected.endereco, selected.cidade, selected.cep].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            {selected.produtos && selected.produtos.length > 0 && (
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--aed-line)' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--fg-3)', fontWeight: 600, marginBottom: 12 }}>
                  Itens
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selected.produtos.map(pid => {
                    const qty = selected.qtds?.[pid] ?? 1;
                    return (
                      <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 'var(--r-sm)', flexShrink: 0,
                          background: 'linear-gradient(135deg, var(--aed-pink-soft), var(--aed-cream))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}><Package size={18} color="var(--aed-pink-deep)" /></div>
                        <div style={{ flex: 1, fontSize: 13, color: 'var(--fg-1)' }}>
                          <div style={{ fontWeight: 500 }}>{pid}</div>
                          <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>Qtd: {qty}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Totals */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--aed-line)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--fg-2)' }}>
                  <span>Produtos</span>
                  <span>R$ {Number(selected.subtotal ?? 0).toFixed(2).replace('.', ',')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--fg-2)' }}>
                  <span>Frete</span>
                  <span>{Number(selected.frete) === 0 ? 'grátis 💜' : `R$ ${Number(selected.frete).toFixed(2).replace('.', ',')}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--fg-2)' }}>
                  <span>Envio</span>
                  <span>{SHIP_LABELS[selected.envio ?? 'correios']}</span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 15, fontWeight: 700, color: 'var(--fg-1)',
                  paddingTop: 10, borderTop: '1px solid var(--aed-line)',
                }}>
                  <span>Total</span>
                  <span>R$ {Number(selected.total ?? 0).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '20px 24px', display: 'flex', gap: 10, marginTop: 'auto' }}>
              <button onClick={() => openEdit(selected)} style={{
                flex: 1, padding: '12px', borderRadius: 'var(--r-pill)',
                border: '1.5px solid var(--aed-pink)', background: 'transparent',
                color: 'var(--aed-pink-deep)', fontFamily: 'inherit', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 6,
              }}>
                ✏️ Editar pedido
              </button>
              {selected.status !== 'entregue' && selected.status !== 'cancelado' && (
                <button onClick={() => advanceStatus(selected)} style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--r-pill)',
                  border: 'none', background: 'var(--aed-pink-deep)', color: '#fff',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 6, boxShadow: 'var(--shadow-sm)',
                }}>
                  Avançar status <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====== NEW / EDIT ORDER MODAL ====== */}
      {showNew && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }} onClick={() => { setShowNew(false); setEditMode(false); }}>
          <div style={{
            background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)',
            width: '100%', maxWidth: 520, maxHeight: '90vh',
            overflowY: 'auto', boxShadow: 'var(--shadow-lg)',
          }} onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px 16px',
              borderBottom: '1px solid var(--aed-line)',
              position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 2,
            }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 20, margin: 0 }}>
                {editMode ? 'Editar pedido' : 'Novo pedido'}
              </h2>
              <button onClick={() => { setShowNew(false); setEditMode(false); }} style={{
                width: 32, height: 32, borderRadius: 999, border: '1px solid var(--aed-line)',
                background: 'transparent', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)',
              }}><X size={16} /></button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Customer selector */}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', marginBottom: 5, fontWeight: 500 }}>
                  Cliente *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={form.cliente}
                    onChange={e => { setForm(f => ({ ...f, cliente: e.target.value })); setCustSearch(e.target.value); }}
                    placeholder="Nome ou busque um cliente cadastrado…"
                    style={{
                      width: '100%', padding: '9px 12px',
                      borderRadius: 'var(--r-sm)', border: '1px solid var(--aed-line-strong)',
                      fontFamily: 'inherit', fontSize: 13, color: 'var(--fg-1)', outline: 'none',
                    }}
                  />
                  {custFiltered.length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                      background: 'var(--bg-surface)', border: '1px solid var(--aed-line)',
                      borderRadius: 'var(--r-sm)', boxShadow: 'var(--shadow-md)',
                      maxHeight: 200, overflowY: 'auto', marginTop: 2,
                    }}>
                      {custFiltered.map(c => (
                        <button key={c.id} type="button" onClick={() => selectCustomer(c)} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', padding: '10px 14px', border: 'none',
                          background: 'transparent', cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'inherit', borderBottom: '1px solid var(--aed-line)',
                        }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--aed-pink-blush)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Avatar name={c.nome} size={30} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-1)' }}>{c.nome}</div>
                            {c.cidade && <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{c.cidade}</div>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2-col grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="WhatsApp" k="whatsapp" />
                <Field label="Data" k="data" type="date" />
                <Field label="Endereço" k="endereco" span />
                <Field label="Cidade" k="cidade" />
                <Field label="CEP" k="cep" />

                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', marginBottom: 5, fontWeight: 500 }}>Envio</label>
                  <select value={form.envio} onChange={e => setForm(f => ({ ...f, envio: e.target.value as ShippingType }))} style={{
                    width: '100%', padding: '9px 12px', borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--aed-line-strong)', fontFamily: 'inherit', fontSize: 13, color: 'var(--fg-1)', outline: 'none',
                  }}>
                    <option value="correios">Correios</option>
                    <option value="motoboy">Motoboy</option>
                    <option value="retirada">Retirada</option>
                  </select>
                </div>
                <Field label="Pagamento" k="pgto" />
                <Field label="Subtotal (R$)" k="subtotal" type="number" />
                <Field label="Frete (R$)" k="frete" type="number" />

                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', marginBottom: 5, fontWeight: 500 }}>Status do pedido</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as OrderStatus }))} style={{
                    width: '100%', padding: '9px 12px', borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--aed-line-strong)', fontFamily: 'inherit', fontSize: 13, color: 'var(--fg-1)', outline: 'none',
                  }}>
                    {Object.entries(STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--fg-3)', marginBottom: 5, fontWeight: 500 }}>Status de pagamento</label>
                  <select value={form.status_pgto} onChange={e => setForm(f => ({ ...f, status_pgto: e.target.value as PaymentStatus }))} style={{
                    width: '100%', padding: '9px 12px', borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--aed-line-strong)', fontFamily: 'inherit', fontSize: 13, color: 'var(--fg-1)', outline: 'none',
                  }}>
                    {Object.entries(PGTO_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Total preview */}
              <div style={{
                padding: '12px 16px', borderRadius: 'var(--r-sm)',
                background: 'var(--aed-pink-mist)', border: '1px solid var(--aed-pink-soft)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>Total do pedido</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--aed-pink-deep)' }}>
                  R$ {(Number(form.subtotal) + Number(form.frete)).toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                <button type="button" onClick={() => { setShowNew(false); setEditMode(false); }} style={{
                  padding: '10px 20px', borderRadius: 'var(--r-pill)',
                  border: '1px solid var(--aed-line)', background: 'transparent',
                  fontFamily: 'inherit', fontSize: 13, color: 'var(--fg-2)', cursor: 'pointer',
                }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{
                  padding: '10px 24px', borderRadius: 'var(--r-pill)',
                  border: 'none', background: 'var(--aed-pink-deep)', color: '#fff',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                }}>
                  {saving ? 'Salvando...' : editMode ? 'Salvar alterações' : 'Criar pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
