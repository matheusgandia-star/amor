export interface Product {
  id: string;
  name: string;
  sub: string;
  price: number;
  cat: string;
  stock: number;
  color: string;
  accent: string;
  photos: string[];
  descricao: string;
  ingredientes: string;
  ritual: string;
  fav: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  featured?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface Customer {
  id: string;
  nome: string;
  whatsapp: string;
  endereco: string;
  cidade: string;
  cep: string;
  created_at?: string;
}

export type OrderStatus = 'novo' | 'preparando' | 'enviado' | 'entregue' | 'cancelado';
export type PaymentStatus = 'aguardando' | 'pago' | 'cancelado';
export type ShippingType = 'correios' | 'motoboy' | 'retirada';

export interface OrderProduct {
  id: string;
  qty: number;
}

export interface Order {
  id: string;
  data: string;
  cliente: string;
  whatsapp: string;
  endereco: string;
  cidade: string;
  cep: string;
  envio: ShippingType;
  frete: number;
  pgto: string;
  status: OrderStatus;
  status_pgto: PaymentStatus;
  produtos: string[];
  qtds: Record<string, number>;
  subtotal: number;
  total: number;
  created_at?: string;
}

export interface SiteSettings {
  mode: 'catalogo' | 'loja';
  whatsapp: string;
  instagram: string;
  banner_url: string;
  banner_mobile_url: string;
  hero_title: string;
  hero_subtitle: string;
  seo_title: string;
  seo_description: string;
  favicon_url: string;
  historia_img_url?: string;
  updated_at?: string;
}
