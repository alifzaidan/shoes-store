import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ShoppingBag, CreditCard, ArrowRight, AlertCircle, Globe, Layout } from 'lucide-react';

interface Shoe {
  id: number;
  name: string;
  brand: string;
  price: number;
  description: string;
  image_url: string;
  stock: number;
}

interface Order {
  id: number;
  order_number: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  shoe: Shoe;
}

interface Props {
  shoes: Shoe[];
  recentOrders: Order[];
  errors?: Record<string, string>;
}

export default function Catalog({ shoes, recentOrders, errors }: Props) {
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);

  const { data, setData, post, processing, reset } = useForm({
    shoe_id: 0,
    payment_method: 'QRIS',
    checkout_mode: 'hosted', // 'hosted' (Xendit Style) or 'custom' (Embedded)
    customer_name: 'Muchammad Alif Zaidan',
    customer_email: 'alif@example.com',
    customer_phone: '081234567890',
  });

  const openCheckout = (shoe: Shoe) => {
    setSelectedShoe(shoe);
    setData((prev) => ({ ...prev, shoe_id: shoe.id }));
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/orders', {
      onSuccess: () => {
        setSelectedShoe(null);
        reset();
      },
    });
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">PAID</span>;
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">PENDING</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">CANCELLED</span>;
      case 'REFUNDED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">REFUNDED</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Head title="SneakerVault - Catalog Sepatu" />

      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-900">SneakerVault</span>
              <span className="ml-2 text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 font-medium rounded-full border border-indigo-200">Merchant Store</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-500 hidden sm:inline">Integration Demo with Payment Gateway API</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-10 overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full backdrop-blur-md">Official Merchant Integration</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Koleksi Sepatu Premium Terbaru</h1>
            <p className="text-indigo-200 text-sm sm:text-base">Dukung 2 Mode Checkout: Laman Hosted Payment Gateway (Xendit Style) & Tampilan Custom Manual API.</p>
          </div>
        </div>

        {errors?.error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errors.error}</span>
          </div>
        )}

        {/* Shoes Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Daftar Sepatu</h2>
            <span className="text-sm text-slate-500">{shoes.length} Produk Tersedia</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shoes.map((shoe) => (
              <div key={shoe.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
                <div>
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    <img
                      src={shoe.image_url}
                      alt={shoe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-medium">
                      {shoe.brand}
                    </span>
                    <span className="absolute top-3 right-3 bg-emerald-500/90 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-xs">
                      Stok: {shoe.stock}
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{shoe.name}</h3>
                    <p className="text-slate-500 text-xs line-clamp-2">{shoe.description}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-4">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Harga</span>
                    <span className="text-lg font-extrabold text-indigo-600">{formatRupiah(shoe.price)}</span>
                  </div>
                  <button
                    onClick={() => openCheckout(shoe)}
                    className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Beli Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Orders Section */}
        {recentOrders.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Riwayat Pesanan Terbaru</h2>
              <span className="text-xs text-slate-400">Merchant Transaction Log</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Sepatu</th>
                    <th className="py-3 px-4">Metode</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-indigo-600">{order.order_number}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">{order.shoe?.name || '-'}</td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">{order.payment_method}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{formatRupiah(order.amount)}</td>
                      <td className="py-3.5 px-4">{getStatusBadge(order.payment_status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          Detail Payment &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Checkout Modal */}
      {selectedShoe && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-lg text-slate-900">Checkout Pembayaran</h3>
              <button
                onClick={() => setSelectedShoe(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                &times;
              </button>
            </div>

            {/* Shoe Preview */}
            <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <img src={selectedShoe.image_url} alt={selectedShoe.name} className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedShoe.name}</h4>
                <p className="text-xs text-slate-500">{selectedShoe.brand}</p>
                <p className="font-extrabold text-indigo-600 text-sm mt-1">{formatRupiah(selectedShoe.price)}</p>
              </div>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {/* Opsi Mode Checkout */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Pilih Opsi Tampilan Checkout</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => setData('checkout_mode', 'hosted')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      data.checkout_mode === 'hosted'
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-600" />
                      Hosted Page (Xendit Style)
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">Laman checkout resmi Payment Gateway</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setData('checkout_mode', 'custom')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      data.checkout_mode === 'custom'
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Layout className="w-3.5 h-3.5 text-indigo-600" />
                      Custom Embedded Page
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">Tampilan manual internal website merchant</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nama Pembeli</label>
                <input
                  type="text"
                  required
                  value={data.customer_name}
                  onChange={(e) => setData('customer_name', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={data.customer_email}
                    onChange={(e) => setData('customer_email', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">No. HP</label>
                  <input
                    type="text"
                    value={data.customer_phone}
                    onChange={(e) => setData('customer_phone', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Pilih Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setData('payment_method', 'QRIS')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      data.payment_method === 'QRIS'
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900">QRIS</span>
                    <span className="text-[11px] text-slate-500 mt-1">E-Wallet / M-Banking</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setData('payment_method', 'VIRTUAL_ACCOUNT')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      data.payment_method === 'VIRTUAL_ACCOUNT'
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900">Virtual Account</span>
                    <span className="text-[11px] text-slate-500 mt-1">Transfer Bank</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedShoe(null)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer flex items-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{processing ? 'Memproses...' : 'Proses Pembayaran'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
