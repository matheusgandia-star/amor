'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('E-mail ou senha incorretos.');
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
      <div className="flex justify-center mb-6">
        <Image src="/assets/logo-pink-outline-horizontal.png" alt="Amor em Dia" width={140} height={40} className="object-contain" />
      </div>
      <h1 className="font-display text-2xl font-light text-center text-[var(--fg-1)] mb-6">Painel Admin</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-[var(--fg-2)] mb-1 block">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)]"
            placeholder="admin@amoremdia.com.br"
          />
        </div>
        <div>
          <label className="text-sm text-[var(--fg-2)] mb-1 block">Senha</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full border border-[var(--aed-line-strong)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--aed-pink)]"
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-xs text-[var(--aed-danger)]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 py-2.5 bg-[var(--aed-pink)] text-white font-medium rounded-sm hover:bg-[var(--aed-pink-deep)] transition-colors disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
