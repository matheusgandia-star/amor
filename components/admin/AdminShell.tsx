'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard, Package, Tag, Users, ShoppingBag, Settings, LogOut,
  Bell, Plus, ChevronRight, X, MoreHorizontal,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Dashboard from './Dashboard';
import ProductsPanel from './ProductsPanel';
import CategoriesPanel from './CategoriesPanel';
import CustomersPanel from './CustomersPanel';
import OrdersPanel from './OrdersPanel';
import SettingsPanel from './SettingsPanel';

type Section = 'dashboard' | 'products' | 'categories' | 'customers' | 'orders' | 'settings';

const GESTAO: { id: Section; label: string; Icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Painel',   Icon: LayoutDashboard },
  { id: 'orders',    label: 'Pedidos',  Icon: ShoppingBag },
  { id: 'products',  label: 'Produtos', Icon: Package },
  { id: 'customers', label: 'Clientes', Icon: Users },
];

const ATELIE: { id: Section; label: string; Icon: React.ElementType }[] = [
  { id: 'categories', label: 'Categorias',    Icon: Tag },
  { id: 'settings',   label: 'Configurações', Icon: Settings },
];

const TITLES: Record<Section, string> = {
  dashboard:  'Painel',
  orders:     'Pedidos',
  products:   'Produtos',
  categories: 'Categorias',
  customers:  'Clientes',
  settings:   'Configurações',
};

const SUBTITLES: Record<Section, string> = {
  dashboard:  'Visão geral do ateliê',
  orders:     'Gerencie seus pedidos',
  products:   'Catálogo de produtos',
  categories: 'Organize as categorias',
  customers:  'Base de clientes',
  settings:   'Configurações do site',
};

const BOTTOM_NAV: { id: Section; label: string; Icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Painel',   Icon: LayoutDashboard },
  { id: 'orders',    label: 'Pedidos',  Icon: ShoppingBag },
  { id: 'products',  label: 'Produtos', Icon: Package },
  { id: 'customers', label: 'Clientes', Icon: Users },
];

function NavItem({
  item, active, onClick,
}: {
  item: { id: Section; label: string; Icon: React.ElementType };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: '10px 14px', borderRadius: 'var(--r-md)', border: 'none',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, textAlign: 'left',
        fontWeight: active ? 600 : 500,
        color: active ? 'var(--aed-pink-deep)' : 'var(--fg-2)',
        background: active ? 'var(--bg-surface)' : 'transparent',
        boxShadow: active ? 'var(--shadow-xs)' : 'none',
        transition: 'all var(--dur-base) var(--ease-soft)',
      }}
    >
      <item.Icon size={17} strokeWidth={1.6} />
      {item.label}
    </button>
  );
}

export default function AdminShell() {
  const [section, setSection]       = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen]     = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  const nav = (s: Section) => {
    setSection(s);
    setSidebarOpen(false);
    setMoreOpen(false);
  };

  const sectionComponents: Record<Section, React.ReactNode> = {
    dashboard:  <Dashboard />,
    products:   <ProductsPanel />,
    categories: <CategoriesPanel />,
    customers:  <CustomersPanel />,
    orders:     <OrdersPanel />,
    settings:   <SettingsPanel />,
  };

  const isMoreSection = section === 'categories' || section === 'settings';

  return (
    <div style={{ display: 'flex', height: '100dvh', background: 'var(--bg-surface-2)' }}>

      {/* ── Sidebar (desktop) / Drawer (mobile) ── */}
      {(sidebarOpen || true) && (
        <aside className={`aed-admin-sidebar ${sidebarOpen ? 'aed-sidebar-open' : ''}`}>
          {/* Logo */}
          <div style={{ padding: '0 8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Image
              src="/assets/logo-pink-outline-horizontal.png"
              alt="Amor em Dia"
              width={140} height={44}
              style={{ height: 44, width: 'auto', objectFit: 'contain' }}
            />
            <button
              className="aed-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'none',
                width: 32, height: 32, borderRadius: 999,
                border: '1px solid var(--aed-line)', background: 'var(--bg-surface)',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--fg-2)',
              }}
            >
              <X size={15} />
            </button>
          </div>

          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--fg-3)', fontWeight: 600, padding: '0 14px 8px' }}>Gestão</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {GESTAO.map(it => <NavItem key={it.id} item={it} active={section === it.id} onClick={() => nav(it.id)} />)}
          </nav>

          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--fg-3)', fontWeight: 600, padding: '20px 14px 8px' }}>Ateliê</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {ATELIE.map(it => <NavItem key={it.id} item={it} active={section === it.id} onClick={() => nav(it.id)} />)}
          </nav>

          {/* Dica do dia */}
          <div style={{ marginTop: 'auto', padding: 16, borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: 18, color: 'var(--aed-pink-deep)', marginBottom: 8 }}>Dica do dia</div>
            <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5, marginBottom: 10 }}>
              Verifique o estoque e prepare a próxima fornada com antecedência. 🌿
            </div>
            <button onClick={() => nav('products')} style={{ fontSize: 12, fontWeight: 600, color: 'var(--aed-pink-deep)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
              Ver estoque ›
            </button>
          </div>
        </aside>
      )}

      {/* Overlay (mobile sidebar) */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'rgba(0,0,0,.35)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── "Mais" bottom sheet (mobile) ── */}
      {moreOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(0,0,0,.35)' }}
            onClick={() => setMoreOpen(false)}
          />
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
            background: 'var(--aed-cream)',
            borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
            padding: '20px 20px 36px',
            boxShadow: '0 -4px 24px rgba(0,0,0,.12)',
            animation: 'slideUp 200ms ease',
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: 'var(--aed-line-strong)', margin: '0 auto 20px' }} />
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--fg-3)', marginBottom: 12 }}>Ateliê</p>
            {ATELIE.map(it => (
              <button key={it.id} onClick={() => nav(it.id)} style={{
                display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                padding: '14px 4px', border: 'none', borderBottom: '1px solid var(--aed-line)',
                background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 15, color: section === it.id ? 'var(--aed-pink-deep)' : 'var(--fg-1)',
                fontWeight: section === it.id ? 600 : 400,
              }}>
                <it.Icon size={20} strokeWidth={1.5} />
                {it.label}
                <ChevronRight size={16} style={{ marginLeft: 'auto', color: 'var(--fg-3)' }} />
              </button>
            ))}
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: 14, width: '100%',
              padding: '14px 4px', border: 'none', background: 'transparent',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, color: '#e05252',
              marginTop: 4,
            }}>
              <LogOut size={20} strokeWidth={1.5} />
              Sair da conta
            </button>
          </div>
        </>
      )}

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Topbar */}
        <header className="aed-admin-topbar">

          {/* Mobile: burger */}
          <button
            className="aed-topbar-burger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Image src="/assets/logo-pink-outline-horizontal.png" alt="Amor em Dia" width={100} height={32} style={{ height: 28, width: 'auto' }} />
          </button>

          {/* Title (desktop only visible via CSS) */}
          <div className="aed-topbar-title">
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 22, color: 'var(--fg-1)', margin: 0, lineHeight: 1.1 }}>{TITLES[section]}</h1>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{SUBTITLES[section]}</div>
          </div>

          {/* Mobile: current page title */}
          <div className="aed-topbar-mobile-title">
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 18, color: 'var(--fg-1)' }}>{TITLES[section]}</span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Search (desktop only) */}
          <div className="aed-topbar-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-3)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Buscar…" style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, color: 'var(--fg-1)', width: '100%' }} />
          </div>

          {/* Bell (desktop only) */}
          <button className="aed-topbar-bell">
            <Bell size={17} strokeWidth={1.6} />
          </button>

          {/* Novo pedido */}
          <button
            onClick={() => nav('orders')}
            className="aed-topbar-neworder"
          >
            <Plus size={15} />
            <span className="aed-topbar-neworder-label">Novo pedido</span>
          </button>

          {/* Avatar + logout (desktop only) */}
          <div className="aed-topbar-avatar">
            <div style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, background: 'linear-gradient(135deg, var(--aed-pink-soft), var(--aed-cream))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, color: 'var(--aed-pink-deep)' }}>AG</div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', whiteSpace: 'nowrap' }}>Ana Gandia</div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>Fundadora</div>
            </div>
            <button onClick={handleLogout} title="Sair" style={{ width: 36, height: 36, borderRadius: 999, border: '1px solid var(--aed-line)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--fg-3)', flexShrink: 0 }}>
              <LogOut size={15} strokeWidth={1.6} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="aed-admin-content">
          {sectionComponents[section]}
        </main>

        {/* ── Bottom navigation (mobile only) ── */}
        <nav className="aed-bottom-nav">
          {BOTTOM_NAV.map(it => (
            <button
              key={it.id}
              onClick={() => nav(it.id)}
              className={`aed-bottom-nav-item ${section === it.id && !isMoreSection ? 'active' : ''}`}
            >
              <it.Icon size={22} strokeWidth={1.5} />
              <span>{it.label}</span>
            </button>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className={`aed-bottom-nav-item ${isMoreSection ? 'active' : ''}`}
          >
            <MoreHorizontal size={22} strokeWidth={1.5} />
            <span>Mais</span>
          </button>
        </nav>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        /* ── Sidebar ── */
        .aed-admin-sidebar {
          width: 252px;
          flex-shrink: 0;
          background: var(--aed-cream);
          border-right: 1px solid var(--aed-line);
          height: 100dvh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 20px 16px;
          z-index: 40;
          transition: transform 220ms ease;
        }

        /* ── Topbar ── */
        .aed-admin-topbar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 32px;
          height: 68px;
          flex-shrink: 0;
          border-bottom: 1px solid var(--aed-line);
          background: rgba(255,253,251,0.92);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .aed-topbar-burger { display: none; background: none; border: none; cursor: pointer; padding: 0; }
        .aed-topbar-mobile-title { display: none; }
        .aed-topbar-title { display: block; }
        .aed-topbar-search {
          display: flex; align-items: center; gap: 8;
          background: var(--bg-surface); border: 1px solid var(--aed-line);
          border-radius: var(--r-pill); padding: 9px 16px; width: 220px;
        }
        .aed-topbar-bell {
          width: 40px; height: 40px; border-radius: 999px;
          border: 1px solid var(--aed-line); background: var(--bg-surface);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--fg-2); flex-shrink: 0;
        }
        .aed-topbar-neworder {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: var(--r-pill);
          border: none; background: var(--aed-pink-deep); color: #fff;
          font-family: inherit; font-size: 13px; font-weight: 600;
          cursor: pointer; flex-shrink: 0; box-shadow: var(--shadow-sm);
        }
        .aed-topbar-avatar {
          display: flex; align-items: center; gap: 10px;
          padding-left: 14px; border-left: 1px solid var(--aed-line);
        }

        /* ── Content ── */
        .aed-admin-content {
          flex: 1;
          overflow-y: auto;
        }

        /* ── Bottom nav ── */
        .aed-bottom-nav { display: none; }

        /* ─────────── MOBILE ─────────── */
        @media (max-width: 768px) {
          /* Sidebar becomes a fixed drawer */
          .aed-admin-sidebar {
            position: fixed;
            inset: 0 auto 0 0;
            transform: translateX(-100%);
            box-shadow: 4px 0 24px rgba(0,0,0,.12);
          }
          .aed-admin-sidebar.aed-sidebar-open {
            transform: translateX(0);
          }
          .aed-sidebar-close { display: flex !important; }

          /* Topbar */
          .aed-admin-topbar {
            padding: 0 16px;
            height: 56px;
            gap: 10px;
          }
          .aed-topbar-burger { display: flex !important; }
          .aed-topbar-title { display: none; }
          .aed-topbar-mobile-title { display: block; }
          .aed-topbar-search { display: none; }
          .aed-topbar-bell { display: none; }
          .aed-topbar-neworder { padding: 8px 14px; }
          .aed-topbar-neworder-label { display: none; }
          .aed-topbar-avatar { display: none; }

          /* Content needs padding for bottom nav */
          .aed-admin-content {
            padding-bottom: 68px;
          }

          /* Bottom nav */
          .aed-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            z-index: 30;
            background: rgba(255,253,251,0.96);
            backdrop-filter: blur(16px);
            border-top: 1px solid var(--aed-line);
            padding: 6px 0 env(safe-area-inset-bottom, 8px);
            box-shadow: 0 -2px 16px rgba(0,0,0,.06);
          }
          .aed-bottom-nav-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            padding: 6px 4px;
            border: none;
            background: transparent;
            cursor: pointer;
            font-family: inherit;
            font-size: 10px;
            color: var(--fg-3);
            font-weight: 500;
            transition: color 150ms;
          }
          .aed-bottom-nav-item.active {
            color: var(--aed-pink-deep);
            font-weight: 700;
          }
          .aed-bottom-nav-item.active svg {
            filter: drop-shadow(0 0 4px var(--aed-pink));
          }
        }
      `}</style>
    </div>
  );
}
