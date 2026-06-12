'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard, Package, Tag, Users, ShoppingBag, Settings, LogOut,
  Menu, X, Bell, Search, Plus,
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
  { id: 'dashboard', label: 'Painel', Icon: LayoutDashboard },
  { id: 'orders',    label: 'Pedidos', Icon: ShoppingBag },
  { id: 'products',  label: 'Produtos', Icon: Package },
  { id: 'customers', label: 'Clientes', Icon: Users },
];

const ATELIE: { id: Section; label: string; Icon: React.ElementType }[] = [
  { id: 'categories', label: 'Categorias', Icon: Tag },
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
  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  const nav = (s: Section) => { setSection(s); setSidebarOpen(false); };

  const sectionComponents: Record<Section, React.ReactNode> = {
    dashboard:  <Dashboard />,
    products:   <ProductsPanel />,
    categories: <CategoriesPanel />,
    customers:  <CustomersPanel />,
    orders:     <OrdersPanel />,
    settings:   <SettingsPanel />,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-surface-2)' }}>

      {/* Sidebar */}
      <aside style={{
        width: 252, flexShrink: 0,
        background: 'var(--aed-cream)',
        borderRight: '1px solid var(--aed-line)',
        height: '100vh', position: 'sticky', top: 0,
        display: 'flex', flexDirection: 'column',
        padding: '20px 16px',
        transition: 'transform 200ms',
        ...(typeof window !== 'undefined' && window.innerWidth < 768
          ? { position: 'fixed', inset: '0 auto 0 0', zIndex: 40, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }
          : {}),
      }}
        className={`aed-sidebar ${sidebarOpen ? '' : 'aed-sidebar-hidden'}`}
      >
        {/* Logo */}
        <div style={{ padding: '0 8px 20px' }}>
          <Image
            src="/assets/logo-pink-outline-horizontal.png"
            alt="Amor em Dia"
            width={140} height={44}
            style={{ height: 44, width: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* Gestão */}
        <div style={{
          fontSize: 10, textTransform: 'uppercase', letterSpacing: '.14em',
          color: 'var(--fg-3)', fontWeight: 600, padding: '0 14px 8px',
        }}>Gestão</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {GESTAO.map(it => (
            <NavItem key={it.id} item={it} active={section === it.id} onClick={() => nav(it.id)} />
          ))}
        </nav>

        {/* Ateliê */}
        <div style={{
          fontSize: 10, textTransform: 'uppercase', letterSpacing: '.14em',
          color: 'var(--fg-3)', fontWeight: 600, padding: '20px 14px 8px',
        }}>Ateliê</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {ATELIE.map(it => (
            <NavItem key={it.id} item={it} active={section === it.id} onClick={() => nav(it.id)} />
          ))}
        </nav>

        {/* Dica do dia */}
        <div style={{
          marginTop: 'auto', padding: 16,
          borderRadius: 'var(--r-md)',
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{
            fontFamily: 'var(--font-script)', fontSize: 18,
            color: 'var(--aed-pink-deep)', marginBottom: 8,
          }}>Dica do dia</div>
          <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5, marginBottom: 10 }}>
            Verifique o estoque e prepare a próxima fornada com antecedência. 🌿
          </div>
          <button onClick={() => nav('products')} style={{
            fontSize: 12, fontWeight: 600, color: 'var(--aed-pink-deep)',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', padding: 0,
          }}>Ver estoque ›</button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(0,0,0,.3)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '0 32px', height: 68, flexShrink: 0,
          borderBottom: '1px solid var(--aed-line)',
          background: 'rgba(255,253,251,0.9)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          {/* Burger mobile */}
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'none', width: 38, height: 38, borderRadius: 999,
              border: '1px solid var(--aed-line)', background: 'var(--bg-surface)',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--fg-2)',
            }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 22,
              color: 'var(--fg-1)', margin: 0, lineHeight: 1.1,
            }}>{TITLES[section]}</h1>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>
              {SUBTITLES[section]}
            </div>
          </div>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-surface)', border: '1px solid var(--aed-line)',
            borderRadius: 'var(--r-pill)', padding: '9px 16px', width: 220,
          }}>
            <Search size={14} color="var(--fg-3)" strokeWidth={1.6} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar…"
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'inherit', fontSize: 13, color: 'var(--fg-1)', width: '100%',
              }}
            />
          </div>

          {/* Bell */}
          <button style={{
            width: 40, height: 40, borderRadius: 999,
            border: '1px solid var(--aed-line)', background: 'var(--bg-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--fg-2)', flexShrink: 0,
          }}>
            <Bell size={17} strokeWidth={1.6} />
          </button>

          {/* Novo pedido */}
          <button
            onClick={() => nav('orders')}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 18px', borderRadius: 'var(--r-pill)',
              border: 'none', background: 'var(--aed-pink-deep)', color: '#fff',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', flexShrink: 0,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Plus size={15} />
            Novo pedido
          </button>

          {/* Avatar + logout */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            paddingLeft: 14, borderLeft: '1px solid var(--aed-line)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 999, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--aed-pink-soft), var(--aed-cream))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, fontSize: 13, color: 'var(--aed-pink-deep)',
            }}>AG</div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', whiteSpace: 'nowrap' }}>Ana Gandia</div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>Fundadora</div>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              style={{
                width: 36, height: 36, borderRadius: 999,
                border: '1px solid var(--aed-line)', background: 'var(--bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--fg-3)', flexShrink: 0,
              }}
            >
              <LogOut size={15} strokeWidth={1.6} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {sectionComponents[section]}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .aed-sidebar { position: fixed !important; z-index: 40; }
          .aed-sidebar-hidden { transform: translateX(-100%) !important; }
        }
      `}</style>
    </div>
  );
}
