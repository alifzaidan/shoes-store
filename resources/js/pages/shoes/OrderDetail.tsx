import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock, XCircle, RefreshCw, Copy, Check, AlertTriangle, RotateCcw, Globe } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Shoe {
  id: number;
  name: string;
  brand: string;
  price: number;
  description: string;
  image_url: string;
}

interface Order {
  id: number;
  order_number: string;
  amount: number;
  payment_method: string;
  payment_gateway_id: string | null;
  payment_status: string;
  payment_data: any;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  shoe: Shoe;
}

interface Props {
  order: Order;
  flash?: {
    success?: string;
  };
  errors?: Record<string, string>;
}

export default function OrderDetail({ order, flash, errors }: Props) {
  const [copied, setCopied] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  // Auto open Hosted Payment Gateway modal popup if URL parameter ?hosted=1 or ?popup=1 is present
  const isHostedParam = typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('hosted') === '1' || new URLSearchParams(window.location.search).get('popup') === '1');
  const [showHostedModal, setShowHostedModal] = useState(isHostedParam && order.payment_status === 'PENDING');

  const { data: refundData, setData: setRefundData, post: postRefund, processing: processingRefund } = useForm({
    reason: 'Barang tidak sesuai / Cacat',
  });

  const { post: postCancel, processing: processingCancel } = useForm({});

  // Auto poll status if status is PENDING
  useEffect(() => {
    if (order.payment_status === 'PENDING') {
      const interval = setInterval(() => {
        router.reload({ only: ['order'] });
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setShowHostedModal(false);
    }
  }, [order.payment_status]);

  const handleRefresh = () => {
    setIsRefetching(true);
    router.reload({
      onFinish: () => setIsRefetching(false),
    });
  };

  const handleCopyVA = (va: string) => {
    navigator.clipboard.writeText(va);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini di Payment Gateway?')) {
      postCancel(`/orders/${order.id}/cancel`);
    }
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    postRefund(`/orders/${order.id}/refund`, {
      onSuccess: () => setShowRefundModal(false),
    });
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3.5 h-3.5" /><span>PAID</span></span>;
      case 'PENDING':
        return <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300"><Clock className="w-3.5 h-3.5 animate-spin" /><span>MENUNGGU PEMBAYARAN</span></span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300"><XCircle className="w-3.5 h-3.5" /><span>DIBATALKAN</span></span>;
      case 'REFUNDED':
        return <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300"><RotateCcw className="w-3.5 h-3.5" /><span>REFUNDED</span></span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  // Parse QR string or VA number from payment_data
  let qrString = '';
  let vaNumber = '';

  if (order.payment_data) {
    if (typeof order.payment_data === 'string') {
      try {
        const parsed = JSON.parse(order.payment_data);
        qrString = parsed.qr_string || order.payment_data;
        vaNumber = parsed.va_number || order.payment_data;
      } catch {
        qrString = order.payment_data;
        vaNumber = order.payment_data;
      }
    } else if (typeof order.payment_data === 'object') {
      qrString = order.payment_data.qr_string || '';
      vaNumber = order.payment_data.va_number || '';
    }
  }

  if (!qrString && order.payment_method === 'QRIS') {
    qrString = '00020101021226300016ID.CO.DUMMY.WWW01189360099900000012345204581253033605802ID5908ShopName6007Jakarta6105123456207070312352040000';
  }
  if (!vaNumber && order.payment_method === 'VIRTUAL_ACCOUNT') {
    vaNumber = '8888019283741';
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Head title={`Detail Order #${order.order_number}`} />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Katalog</span>
          </Link>

          <div className="flex items-center space-x-3">
            {order.payment_gateway_id && (
              <button
                onClick={() => setShowHostedModal(true)}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Laman Hosted Gateway</span>
              </button>
            )}

            <button
              onClick={handleRefresh}
              disabled={isRefetching}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {flash?.success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center space-x-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{flash.success}</span>
          </div>
        )}

        {errors?.error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center space-x-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errors.error}</span>
          </div>
        )}

        {/* Status Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-extrabold text-slate-900 font-mono">Order #{order.order_number}</h1>
              {getStatusBadge(order.payment_status)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Payment Gateway Ref: <span className="font-mono text-slate-600">{order.payment_gateway_id || 'Generating...'}</span></p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block font-medium">Total Pembayaran</span>
            <span className="text-2xl font-black text-indigo-600">{formatRupiah(order.amount)}</span>
          </div>
        </div>

        {/* Dynamic Payment Instruction Section */}
        {order.payment_status === 'PENDING' && (
          <div className="bg-white rounded-2xl border border-amber-200 p-6 sm:p-8 shadow-md space-y-6 text-center">
            <div className="space-y-1">
              <span className="inline-block text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                {order.payment_method === 'QRIS' ? 'QRIS Instant Payment' : 'Virtual Account Transfer'}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 pt-2">Instruksi Pembayaran</h2>
              <p className="text-xs text-slate-500">Halaman ini akan otomatis ter-update saat callback Payment Gateway diterima.</p>
            </div>

            {/* QRIS Display */}
            {order.payment_method === 'QRIS' && (
              <div className="flex flex-col items-center justify-center space-y-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-lg inline-block">
                  <QRCodeSVG value={qrString} size={220} />
                </div>
                <p className="text-xs font-medium text-slate-600 max-w-xs">
                  Scan QRIS di atas menggunakan aplikasi <strong>GoPay, OVO, ShopeePay, Dana, LinkAja, atau Mobile Banking</strong> favorit Anda.
                </p>
              </div>
            )}

            {/* Virtual Account Display */}
            {order.payment_method === 'VIRTUAL_ACCOUNT' && (
              <div className="flex flex-col items-center justify-center space-y-3 pt-2">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Nomor Virtual Account</span>
                <div className="flex items-center space-x-3 bg-slate-100 px-6 py-3 rounded-2xl border border-slate-300">
                  <span className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-slate-900">
                    {vaNumber}
                  </span>
                  <button
                    onClick={() => handleCopyVA(vaNumber)}
                    className="p-2 text-indigo-600 hover:text-indigo-800 bg-white rounded-xl shadow-xs border border-slate-200 cursor-pointer"
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500">Lakukan transfer ke nomor Virtual Account di atas sebelum masa berlaku habis.</p>
              </div>
            )}

            {/* Cancel Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center space-x-3">
              <form onSubmit={handleCancelOrder}>
                <button
                  type="submit"
                  disabled={processingCancel}
                  className="inline-flex items-center space-x-2 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{processingCancel ? 'Membatalkan...' : 'Batalkan Pesanan (API)'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Paid Confirmation Section */}
        {order.payment_status === 'PAID' && (
          <div className="bg-emerald-950/5 rounded-2xl border border-emerald-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-emerald-900">Pembayaran Berhasil!</h2>
                <p className="text-xs text-emerald-700">Terima kasih, pembayaran Anda telah berhasil diverifikasi oleh Payment Gateway.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="bg-white p-4 rounded-xl border border-emerald-100 space-y-1">
                <span className="text-slate-400 block font-medium">Waktu Pembayaran</span>
                <span className="font-semibold text-slate-800">{order.paid_at || '-'}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-100 space-y-1">
                <span className="text-slate-400 block font-medium">Metode Pembayaran</span>
                <span className="font-semibold text-slate-800">{order.payment_method}</span>
              </div>
            </div>

            {/* Refund Action */}
            <div className="pt-4 border-t border-emerald-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Ada kendala dengan barang Anda?</span>
              <button
                onClick={() => setShowRefundModal(true)}
                className="inline-flex items-center space-x-2 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-4 py-2.5 rounded-xl border border-purple-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Minta Refund Dana (API)</span>
              </button>
            </div>
          </div>
        )}

        {/* Cancelled / Refunded Info Banners */}
        {order.payment_status === 'CANCELLED' && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-center space-x-4 text-rose-900">
            <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
            <div>
              <h3 className="font-bold text-base">Pesanan Dibatalkan</h3>
              <p className="text-xs text-rose-700">Pesanan ini telah dibatalkan pada {order.cancelled_at || '-'}.</p>
            </div>
          </div>
        )}

        {order.payment_status === 'REFUNDED' && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 flex items-center space-x-4 text-purple-900">
            <RotateCcw className="w-8 h-8 text-purple-600 shrink-0" />
            <div>
              <h3 className="font-bold text-base">Dana Telah Dikembalikan (Refunded)</h3>
              <p className="text-xs text-purple-700">Refund dana sebesar {formatRupiah(order.amount)} telah diproses pada {order.refunded_at || '-'}.</p>
            </div>
          </div>
        )}

        {/* Product & Customer Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Detail Pesanan & Pembeli</h3>

          <div className="flex items-center space-x-4">
            <img src={order.shoe?.image_url} alt={order.shoe?.name} className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">{order.shoe?.brand}</span>
              <h4 className="font-extrabold text-slate-900 text-base">{order.shoe?.name}</h4>
              <p className="text-indigo-600 font-bold text-sm">{formatRupiah(order.amount)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block">Nama Pembeli</span>
              <span className="font-semibold text-slate-800">{order.customer_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Email</span>
              <span className="font-semibold text-slate-800">{order.customer_email}</span>
            </div>
            <div>
              <span className="text-slate-400 block">No. HP</span>
              <span className="font-semibold text-slate-800">{order.customer_phone || '-'}</span>
            </div>
          </div>
        </div>

      </main>

      {/* Hosted Payment Gateway Modal Popup */}
      {showHostedModal && order.payment_gateway_id && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Laman Pembayaran Payment Gateway (Xendit Style)</h3>
                  <p className="text-[11px] text-slate-400">Official Hosted Checkout Overlay</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <a
                  href={`http://localhost:5173/pay/${order.payment_gateway_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-300 hover:text-white underline font-medium flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Buka di Tab Baru</span>
                </a>
                <button
                  onClick={() => setShowHostedModal(false)}
                  className="text-slate-400 hover:text-white text-xl font-bold p-1 leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 relative overflow-hidden">
              <iframe
                src={`http://localhost:5173/pay/${order.payment_gateway_id}`}
                title="Hosted Payment Gateway Checkout"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Pengajuan Refund Pembayaran</h3>
              <button onClick={() => setShowRefundModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">&times;</button>
            </div>

            <p className="text-xs text-slate-600">
              Pengajuan ini akan mengirimkan permintaan API refund sebesar <strong>{formatRupiah(order.amount)}</strong> langsung ke Payment Gateway.
            </p>

            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Alasan Refund</label>
                <textarea
                  rows={3}
                  value={refundData.reason}
                  onChange={(e) => setRefundData('reason', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Contoh: Ukuran sepatu tidak pas / Barang cacat"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processingRefund}
                  className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {processingRefund ? 'Memproses...' : 'Kirim Request Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
