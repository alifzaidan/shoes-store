import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

const invoices = [
    {
        id: 1,
        created_at: '2025-05-30 10:00:00',
        total: 300000,
        status: 'selesai',
        items: [
            {
                id: 1,
                product: { title: 'Sepatu Keren', image: 'contoh-sepatu.jpg' },
                qty: 1,
                price: 200000,
            },
            {
                id: 2,
                product: { title: 'Sandal Santai', image: 'contoh-sandal.jpg' },
                qty: 2,
                price: 50000,
            },
        ],
    },
    {
        id: 2,
        created_at: '2025-05-28 14:30:00',
        total: 150000,
        status: 'diproses',
        items: [
            {
                id: 3,
                product: { title: 'Sneakers Putih', image: 'contoh-sneakers.jpg' },
                qty: 1,
                price: 150000,
            },
        ],
    },
];

export default function Invoice() {
    return (
        <AppLayout>
            <Head title="Riwayat Pembelian" />
            <div className="p-4">
                <h1 className="mb-6 text-2xl font-bold">Riwayat Pembelian</h1>
                {invoices.length === 0 ? (
                    <div className="text-muted-foreground text-center">Belum ada riwayat pembelian.</div>
                ) : (
                    <div className="space-y-6">
                        {invoices.map((invoice) => (
                            <div key={invoice.id} className="rounded-xl border p-4 shadow-sm">
                                <div className="mb-2 flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold">Invoice #{invoice.id}</div>
                                        <div className="text-muted-foreground text-xs">{new Date(invoice.created_at).toLocaleString('id-ID')}</div>
                                    </div>
                                    <Badge className="ml-2">{invoice.status}</Badge>
                                </div>
                                <div className="divide-y">
                                    {invoice.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 py-2">
                                            <img
                                                src={`/storage/${item.product.image}`}
                                                alt={item.product.title}
                                                className="h-12 w-12 rounded border object-cover"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium">{item.product.title}</div>
                                                <div className="text-muted-foreground text-xs">
                                                    {item.qty} x Rp{item.price.toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                            <div className="text-sm font-semibold">Rp{(item.qty * item.price).toLocaleString('id-ID')}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 flex items-center justify-between font-semibold">
                                    <span>Total</span>
                                    <span>Rp{invoice.total.toLocaleString('id-ID')}</span>
                                </div>
                                <Button className="mt-2" asChild>
                                    <Link href={route('invoice.showDetail', invoice.id)}>Lihat Detail</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
