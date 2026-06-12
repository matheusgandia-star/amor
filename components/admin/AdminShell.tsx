'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, Package, Tag, Users, ShoppingBag, Settings, LogOut, Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Dashboard from './Dashboard';
import ProductsPanel from './ProductsPanel';
import CategoriesPanel from './CategoriesPanel';
import CustomersPanel from './CustomersPanel';
import OrdersPanel from './OrdersPanel';
import SettingsPanel from './SettingsPanel';

type Section = 'dashboard' | 'products' | 'categories' | 'customers' | 'orders' | 'settings';

const navItems: { id: Section; label: string; Icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'orders', label: 'Pedidos', Icon: ShoppingBag },
  { id: 'products', label: 'Produtos', Icon: Package },
  { id: 'categories', label: 'Categorias', Icon: Tag },
  { id: 'customers', label: 'Clientes', Icon: Users },
  { id: 'settings', label: 'Configurações', Icon: Settings },
];

export default function AdminShell() {
  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  const sectionComponents: Record<Section, React.ReactNode> = {
    dashboard: <Dashboard />,
    products: <ProductsPanel />,
    categories: <CategoriesPanel />,
    customers: <CustomersPanel />,
    orders: <OrdersPanel />,
    settings: <SettingsPanel />,
  };

  return (
    <div className="flex h-screen bg-[var(--bg-surface-2)]">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-56 bg-white border-r border-[var(--aed-line)] flex flex-col
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:static md:translate-x-0
      `}>
        <div className="p-4 border-b border-[var(--aed-line)]">
          <Image src="/assets/logo-pink-outline-horizontal.png" alt="Amor em Dia" width={120} height={34} className="object-contain" />
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setSection(id); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm w-full text-left transition-colors ${
                section === id
                  ? 'bg-[var(--aed-pink-mist)] text-[var(--aed-pink-deep)] font-medium'
                  : 'text-[var(--fg-2)] hover:bg-[var(--bg-surface-2)]'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[var(--fg-3)] hover:bg-[var(--bg-surface-2)] w-full text-left"
        >
          <LogOut size={16} />
          Sair
        </button>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-[var(--aed-line)] h-14 flex items-center px-4 gap-3 md:px-6">
          <button className="md:hidden text-[var(--fg-2)]" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="font-display text-xl font-light text-[var(--fg-1)]">
            {navItems.find(n => n.id === section)?.label}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {sectionComponents[section]}
        </main>
      </div>
    </div>
  );
}
